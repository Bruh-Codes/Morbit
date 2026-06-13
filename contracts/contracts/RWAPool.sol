// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

interface IERC20Metadata {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function decimals() external view returns (uint8);
    function symbol() external view returns (string memory);
    function name() external view returns (string memory);
}

contract RWAPool is Initializable, OwnableUpgradeable {
    uint256 public constant BPS = 10_000;
    uint256 public constant HEALTH_FACTOR_DECIMALS = 1e18;
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    uint256 public constant BASE_CURRENCY_DECIMALS = 8;
    uint256 public constant CLOSE_FACTOR_BPS = 5_000;
    uint256 public constant FULL_LIQUIDATION_HF_THRESHOLD = 0.95e18;

    struct ReserveConfig {
        bool initialized;
        bool borrowingEnabled;
        bool collateralEnabled;
        uint16 ltv;
        uint16 liquidationThreshold;
        uint16 liquidationBonus;
        uint16 supplyRateBps;
        uint16 borrowRateBps;
        uint8 decimals;
        uint128 priceUsd;
    }

    struct AggregatedReserveData {
        address asset;
        string name;
        string symbol;
        uint8 decimals;
        bool borrowingEnabled;
        bool collateralEnabled;
        uint16 ltv;
        uint16 liquidationThreshold;
        uint16 liquidationBonus;
        uint16 supplyRateBps;
        uint16 borrowRateBps;
        uint128 priceUsd;
        uint256 totalSupplied;
        uint256 totalBorrowed;
        uint256 availableLiquidity;
    }

    struct UserReserveData {
        address asset;
        uint256 supplied;
        uint256 currentDebt;
        bool usageAsCollateralEnabled;
    }

    address[] internal _reservesList;
    mapping(address => ReserveConfig) public reserveConfigs;
    mapping(address => uint256) public totalSupplied;
    mapping(address => uint256) public totalBorrowed;
    mapping(address => mapping(address => uint256)) public supplied;
    mapping(address => mapping(address => uint256)) public debtPrincipal;
    mapping(address => mapping(address => uint256)) public debtTimestamp;
    mapping(address => mapping(address => bool)) public collateralDisabled;

    event ReserveInitialized(address indexed asset);
    event PriceUpdated(address indexed asset, uint256 priceUsd);
    event Supply(
        address indexed reserve, address user, address indexed onBehalfOf,
        uint256 amount, uint16 referralCode
    );
    event Withdraw(
        address indexed reserve, address indexed user, address indexed to, uint256 amount
    );
    event Borrow(
        address indexed reserve, address user, address indexed onBehalfOf,
        uint256 amount, uint256 interestRateMode, uint256 borrowRate, uint16 referralCode
    );
    event Repay(
        address indexed reserve, address indexed user, address indexed repayer,
        uint256 amount, bool useATokens
    );
    event ReserveUsedAsCollateralEnabled(address indexed reserve, address indexed user);
    event ReserveUsedAsCollateralDisabled(address indexed reserve, address indexed user);
    event LiquidationCall(
        address indexed collateralAsset, address indexed debtAsset, address indexed user,
        uint256 debtToCover, uint256 liquidatedCollateralAmount,
        address liquidator, bool receiveAToken
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __Ownable_init(msg.sender);
    }

    function initReserve(
        address asset,
        bool borrowingEnabled,
        bool collateralEnabled,
        uint16 ltv,
        uint16 liquidationThreshold,
        uint16 liquidationBonus,
        uint16 supplyRateBps,
        uint16 borrowRateBps,
        uint128 priceUsd
    ) external onlyOwner {
        require(!reserveConfigs[asset].initialized, "already initialized");
        require(liquidationThreshold >= ltv, "threshold < ltv");
        require(priceUsd > 0, "price required");

        reserveConfigs[asset] = ReserveConfig({
            initialized: true,
            borrowingEnabled: borrowingEnabled,
            collateralEnabled: collateralEnabled,
            ltv: ltv,
            liquidationThreshold: liquidationThreshold,
            liquidationBonus: liquidationBonus,
            supplyRateBps: supplyRateBps,
            borrowRateBps: borrowRateBps,
            decimals: IERC20Metadata(asset).decimals(),
            priceUsd: priceUsd
        });
        _reservesList.push(asset);
        emit ReserveInitialized(asset);
    }

    function setAssetPrice(address asset, uint128 priceUsd) external onlyOwner {
        require(reserveConfigs[asset].initialized, "unknown asset");
        require(priceUsd > 0, "price required");
        reserveConfigs[asset].priceUsd = priceUsd;
        emit PriceUpdated(asset, priceUsd);
    }

    function rescue(address asset, uint256 amount, address to) external onlyOwner {
        IERC20Metadata(asset).transfer(to, amount);
    }

    function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external {
        require(reserveConfigs[asset].initialized, "unknown asset");
        require(amount > 0, "zero amount");

        require(
            IERC20Metadata(asset).transferFrom(msg.sender, address(this), amount),
            "transfer failed"
        );
        supplied[onBehalfOf][asset] += amount;
        totalSupplied[asset] += amount;

        emit Supply(asset, msg.sender, onBehalfOf, amount, referralCode);
    }

    function withdraw(address asset, uint256 amount, address to) external returns (uint256) {
        require(reserveConfigs[asset].initialized, "unknown asset");
        uint256 userBalance = supplied[msg.sender][asset];
        uint256 amountToWithdraw = amount == type(uint256).max ? userBalance : amount;
        require(amountToWithdraw > 0 && amountToWithdraw <= userBalance, "invalid amount");

        supplied[msg.sender][asset] = userBalance - amountToWithdraw;
        totalSupplied[asset] -= amountToWithdraw;

        (, uint256 totalDebtBase, , , , uint256 healthFactor) = getUserAccountData(msg.sender);
        require(
            totalDebtBase == 0 || healthFactor >= HEALTH_FACTOR_DECIMALS,
            "HF too low after withdraw"
        );

        require(IERC20Metadata(asset).transfer(to, amountToWithdraw), "transfer failed");
        emit Withdraw(asset, msg.sender, to, amountToWithdraw);
        return amountToWithdraw;
    }

    function borrow(
        address asset,
        uint256 amount,
        uint256 interestRateMode,
        uint16 referralCode,
        address onBehalfOf
    ) external {
        ReserveConfig storage cfg = reserveConfigs[asset];
        require(cfg.initialized, "unknown asset");
        require(cfg.borrowingEnabled, "borrowing disabled");
        require(amount > 0, "zero amount");
        require(onBehalfOf == msg.sender, "credit delegation unsupported");
        require(IERC20Metadata(asset).balanceOf(address(this)) >= amount, "insufficient liquidity");

        _accrue(msg.sender, asset);
        debtPrincipal[msg.sender][asset] += amount;
        totalBorrowed[asset] += amount;

        (uint256 collateralBase, uint256 debtBase, , , uint256 avgLtv, ) = getUserAccountData(msg.sender);
        require(debtBase * BPS <= collateralBase * avgLtv, "exceeds LTV");

        require(IERC20Metadata(asset).transfer(msg.sender, amount), "transfer failed");
        emit Borrow(asset, msg.sender, onBehalfOf, amount, interestRateMode, cfg.borrowRateBps, referralCode);
    }

    function repay(
        address asset,
        uint256 amount,
        uint256,
        address onBehalfOf
    ) external returns (uint256) {
        require(reserveConfigs[asset].initialized, "unknown asset");

        _accrue(onBehalfOf, asset);
        uint256 debt = debtPrincipal[onBehalfOf][asset];
        require(debt > 0, "no debt");

        uint256 paybackAmount = (amount == type(uint256).max || amount > debt) ? debt : amount;
        require(
            IERC20Metadata(asset).transferFrom(msg.sender, address(this), paybackAmount),
            "transfer failed"
        );

        debtPrincipal[onBehalfOf][asset] = debt - paybackAmount;
        totalBorrowed[asset] = totalBorrowed[asset] >= paybackAmount
            ? totalBorrowed[asset] - paybackAmount
            : 0;

        emit Repay(asset, onBehalfOf, msg.sender, paybackAmount, false);
        return paybackAmount;
    }

    function liquidationCall(
        address collateralAsset,
        address debtAsset,
        address user,
        uint256 debtToCover,
        bool receiveAToken
    ) external returns (uint256, uint256) {
        require(reserveConfigs[collateralAsset].initialized && reserveConfigs[debtAsset].initialized, "unknown asset");
        require(reserveConfigs[collateralAsset].collateralEnabled, "asset not collateral");
        require(!collateralDisabled[user][collateralAsset], "collateral not active");
        require(debtToCover > 0, "zero amount");

        (, uint256 totalDebtBase, , , , uint256 healthFactor) = getUserAccountData(user);
        require(totalDebtBase > 0 && healthFactor < HEALTH_FACTOR_DECIMALS, "HF not below 1");

        _accrue(user, debtAsset);
        uint256 userDebt = debtPrincipal[user][debtAsset];
        require(userDebt > 0, "no debt in asset");
        uint256 maxLiquidatable = healthFactor < FULL_LIQUIDATION_HF_THRESHOLD
            ? userDebt
            : (userDebt * CLOSE_FACTOR_BPS) / BPS;
        uint256 actualDebtToCover = debtToCover > maxLiquidatable ? maxLiquidatable : debtToCover;

        return _executeSeizure(collateralAsset, debtAsset, user, actualDebtToCover, userDebt, receiveAToken);
    }

    function setUserUseReserveAsCollateral(address asset, bool useAsCollateral) external {
        require(reserveConfigs[asset].initialized, "unknown asset");
        collateralDisabled[msg.sender][asset] = !useAsCollateral;

        if (!useAsCollateral) {
            (, uint256 totalDebtBase, , , , uint256 healthFactor) = getUserAccountData(msg.sender);
            require(totalDebtBase == 0 || healthFactor >= HEALTH_FACTOR_DECIMALS, "HF too low");
            emit ReserveUsedAsCollateralDisabled(asset, msg.sender);
        } else {
            emit ReserveUsedAsCollateralEnabled(asset, msg.sender);
        }
    }

    function getUserAccountData(address user)
        public
        view
        returns (
            uint256 totalCollateralBase,
            uint256 totalDebtBase,
            uint256 availableBorrowsBase,
            uint256 currentLiquidationThreshold,
            uint256 ltv,
            uint256 healthFactor
        )
    {
        uint256 weightedLtv;
        uint256 weightedThreshold;

        for (uint256 i = 0; i < _reservesList.length; i++) {
            address asset = _reservesList[i];
            ReserveConfig storage cfg = reserveConfigs[asset];

            uint256 userSupply = supplied[user][asset];
            if (userSupply > 0 && cfg.collateralEnabled && !collateralDisabled[user][asset]) {
                uint256 value = (userSupply * cfg.priceUsd) / (10 ** cfg.decimals);
                totalCollateralBase += value;
                weightedLtv += value * cfg.ltv;
                weightedThreshold += value * cfg.liquidationThreshold;
            }

            uint256 debt = _currentDebt(user, asset);
            if (debt > 0) {
                totalDebtBase += (debt * cfg.priceUsd) / (10 ** cfg.decimals);
            }
        }

        if (totalCollateralBase > 0) {
            ltv = weightedLtv / totalCollateralBase;
            currentLiquidationThreshold = weightedThreshold / totalCollateralBase;
        }

        uint256 borrowingPower = (totalCollateralBase * ltv) / BPS;
        availableBorrowsBase = borrowingPower > totalDebtBase ? borrowingPower - totalDebtBase : 0;

        if (totalDebtBase == 0) {
            healthFactor = type(uint256).max;
        } else {
            healthFactor =
                (totalCollateralBase * currentLiquidationThreshold * HEALTH_FACTOR_DECIMALS)
                / (totalDebtBase * BPS);
        }
    }

    function getReservesList() external view returns (address[] memory) {
        return _reservesList;
    }

    function getAllReservesData() external view returns (AggregatedReserveData[] memory data) {
        data = new AggregatedReserveData[](_reservesList.length);
        for (uint256 i = 0; i < _reservesList.length; i++) {
            address asset = _reservesList[i];
            ReserveConfig storage cfg = reserveConfigs[asset];
            data[i] = AggregatedReserveData({
                asset: asset,
                name: IERC20Metadata(asset).name(),
                symbol: IERC20Metadata(asset).symbol(),
                decimals: cfg.decimals,
                borrowingEnabled: cfg.borrowingEnabled,
                collateralEnabled: cfg.collateralEnabled,
                ltv: cfg.ltv,
                liquidationThreshold: cfg.liquidationThreshold,
                liquidationBonus: cfg.liquidationBonus,
                supplyRateBps: cfg.supplyRateBps,
                borrowRateBps: cfg.borrowRateBps,
                priceUsd: cfg.priceUsd,
                totalSupplied: totalSupplied[asset],
                totalBorrowed: totalBorrowed[asset],
                availableLiquidity: IERC20Metadata(asset).balanceOf(address(this))
            });
        }
    }

    function getUserReservesData(address user) external view returns (UserReserveData[] memory data) {
        data = new UserReserveData[](_reservesList.length);
        for (uint256 i = 0; i < _reservesList.length; i++) {
            address asset = _reservesList[i];
            data[i] = UserReserveData({
                asset: asset,
                supplied: supplied[user][asset],
                currentDebt: _currentDebt(user, asset),
                usageAsCollateralEnabled: !collateralDisabled[user][asset]
            });
        }
    }

    function getAssetPrice(address asset) external view returns (uint256) {
        return reserveConfigs[asset].priceUsd;
    }

    function _executeSeizure(
        address collateralAsset,
        address debtAsset,
        address user,
        uint256 actualDebtToCover,
        uint256 userDebt,
        bool receiveAToken
    ) internal returns (uint256, uint256) {
        ReserveConfig storage collCfg = reserveConfigs[collateralAsset];
        ReserveConfig storage debtCfg = reserveConfigs[debtAsset];

        uint256 debtValueBase = (actualDebtToCover * debtCfg.priceUsd) / (10 ** debtCfg.decimals);
        uint256 collateralToSeize = (debtValueBase * (BPS + collCfg.liquidationBonus) * (10 ** collCfg.decimals))
            / (collCfg.priceUsd * BPS);

        uint256 userCollateral_ = supplied[user][collateralAsset];
        require(userCollateral_ > 0, "no collateral in asset");
        if (collateralToSeize > userCollateral_) {
            collateralToSeize = userCollateral_;
            uint256 seizedValueBase = (collateralToSeize * collCfg.priceUsd) / (10 ** collCfg.decimals);
            actualDebtToCover =
                (seizedValueBase * BPS * (10 ** debtCfg.decimals))
                / ((BPS + collCfg.liquidationBonus) * debtCfg.priceUsd);
        }

        require(
            IERC20Metadata(debtAsset).transferFrom(msg.sender, address(this), actualDebtToCover),
            "transfer failed"
        );
        debtPrincipal[user][debtAsset] = userDebt - actualDebtToCover;
        totalBorrowed[debtAsset] = totalBorrowed[debtAsset] >= actualDebtToCover
            ? totalBorrowed[debtAsset] - actualDebtToCover
            : 0;

        supplied[user][collateralAsset] = userCollateral_ - collateralToSeize;
        totalSupplied[collateralAsset] -= collateralToSeize;
        require(IERC20Metadata(collateralAsset).transfer(msg.sender, collateralToSeize), "transfer failed");

        emit LiquidationCall(
            collateralAsset, debtAsset, user,
            actualDebtToCover, collateralToSeize, msg.sender, receiveAToken
        );
        return (actualDebtToCover, collateralToSeize);
    }

    function _currentDebt(address user, address asset) internal view returns (uint256) {
        uint256 principal = debtPrincipal[user][asset];
        if (principal == 0) return 0;
        uint256 dt = block.timestamp - debtTimestamp[user][asset];
        uint256 interest = (principal * reserveConfigs[asset].borrowRateBps * dt) / (BPS * SECONDS_PER_YEAR);
        return principal + interest;
    }

    function _accrue(address user, address asset) internal {
        uint256 current = _currentDebt(user, asset);
        uint256 principal = debtPrincipal[user][asset];
        if (current > principal) {
            debtPrincipal[user][asset] = current;
            totalBorrowed[asset] += current - principal;
        }
        debtTimestamp[user][asset] = block.timestamp;
    }

    uint256[50] private __gap;
}
