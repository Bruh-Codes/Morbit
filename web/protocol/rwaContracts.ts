// On-chain glue for the Morbit RWAPool on Robinhood Chain Testnet.
// This is the single source of truth the aave-compat layer uses to read
// reserve + user data and to encode transactions.

import { Provider, StaticJsonRpcProvider } from '@ethersproject/providers';
import { BigNumber as EthersBigNumber, Contract, utils } from 'ethers';

import deployment from '../ui-config/robinhoodDeployment.json';
import { rwaTokens } from './rwaTokens';
import { ChainId } from './types';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const RWA_POOL_ADDRESS = deployment.pool.toLowerCase();

export const ROBINHOOD_RPC_URL = deployment.rpcUrl;

export const RWA_POOL_ABI = [
  // user actions (Aave V3 compatible)
  'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)',
  'function withdraw(address asset, uint256 amount, address to) returns (uint256)',
  'function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf)',
  'function repay(address asset, uint256 amount, uint256 interestRateMode, address onBehalfOf) returns (uint256)',
  'function setUserUseReserveAsCollateral(address asset, bool useAsCollateral)',
  'function liquidationCall(address collateralAsset, address debtAsset, address user, uint256 debtToCover, bool receiveAToken) returns (uint256, uint256)',
  // views
  'function getUserAccountData(address user) view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)',
  'function getReservesList() view returns (address[])',
  'function getAllReservesData() view returns (tuple(address asset, string name, string symbol, uint8 decimals, bool borrowingEnabled, bool collateralEnabled, uint16 ltv, uint16 liquidationThreshold, uint16 liquidationBonus, uint16 supplyRateBps, uint16 borrowRateBps, uint128 priceUsd, uint256 totalSupplied, uint256 totalBorrowed, uint256 availableLiquidity)[])',
  'function getUserReservesData(address user) view returns (tuple(address asset, uint256 supplied, uint256 currentDebt, bool usageAsCollateralEnabled)[])',
  'function getAssetPrice(address asset) view returns (uint256)',
];

export const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function faucet()',
];

export const rwaPoolInterface = new utils.Interface(RWA_POOL_ABI);
export const erc20Interface = new utils.Interface(ERC20_ABI);

let fallbackProvider: StaticJsonRpcProvider | undefined;
/** Provider used when callers (e.g. markets()) don't have one injected. */
export const getRobinhoodProvider = (): StaticJsonRpcProvider => {
  if (!fallbackProvider) {
    fallbackProvider = new StaticJsonRpcProvider(ROBINHOOD_RPC_URL, ChainId.robinhood_testnet);
  }
  return fallbackProvider;
};

export const getRwaPoolContract = (provider: Provider, address?: string) =>
  new Contract(address || RWA_POOL_ADDRESS, RWA_POOL_ABI, provider);

export const getErc20Contract = (token: string, provider: Provider) =>
  new Contract(token, ERC20_ABI, provider);

// ---------------------------------------------------------------- raw shapes

export interface RwaReserveOnChain {
  asset: string;
  name: string;
  symbol: string;
  decimals: number;
  borrowingEnabled: boolean;
  collateralEnabled: boolean;
  ltv: string; // bps
  liquidationThreshold: string; // bps
  liquidationBonus: string; // bps over par
  supplyRateBps: number;
  borrowRateBps: number;
  priceUsd: string; // 8 decimals, raw
  totalSupplied: string; // raw token units
  totalBorrowed: string; // raw token units
  availableLiquidity: string; // raw token units
}

export interface RwaUserReserveOnChain {
  asset: string;
  supplied: string; // raw token units
  currentDebt: string; // raw token units
  usageAsCollateralEnabled: boolean;
}

const isDeployed = () => RWA_POOL_ADDRESS !== ZERO_ADDRESS;

function mockReserves(): RwaReserveOnChain[] {
  return Object.values(rwaTokens).map((t) => ({
    asset: t.address.toLowerCase(),
    name: t.name,
    symbol: t.symbol,
    decimals: t.decimals,
    borrowingEnabled: t.category === 'stablecoin',
    collateralEnabled: t.category !== 'stablecoin',
    ltv: t.category === 'stablecoin' ? '0' : '7000',
    liquidationThreshold: t.category === 'stablecoin' ? '0' : '8250',
    liquidationBonus: t.category === 'stablecoin' ? '0' : '500',
    supplyRateBps: 280,
    borrowRateBps: t.category === 'stablecoin' ? 620 : 410,
    priceUsd: String(t.priceUsd * 1e8),
    totalSupplied: t.category === 'stablecoin' ? '50000000000' : '10000000000000000000000000',
    totalBorrowed: t.category === 'stablecoin' ? '30000000000' : '4000000000000000000000000',
    availableLiquidity: t.category === 'stablecoin' ? '20000000000' : '6000000000000000000000000',
  }));
}

export async function fetchRwaReserves(provider?: Provider): Promise<RwaReserveOnChain[]> {
  if (!isDeployed()) {
    return mockReserves();
  }
  const pool = getRwaPoolContract(provider || getRobinhoodProvider());
  const raw = await pool.getAllReservesData();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return raw.map((r: any) => ({
    asset: (r.asset as string).toLowerCase(),
    name: r.name as string,
    symbol: r.symbol as string,
    decimals: Number(r.decimals),
    borrowingEnabled: r.borrowingEnabled as boolean,
    collateralEnabled: r.collateralEnabled as boolean,
    ltv: r.ltv.toString(),
    liquidationThreshold: r.liquidationThreshold.toString(),
    liquidationBonus: r.liquidationBonus.toString(),
    supplyRateBps: Number(r.supplyRateBps),
    borrowRateBps: Number(r.borrowRateBps),
    priceUsd: r.priceUsd.toString(),
    totalSupplied: r.totalSupplied.toString(),
    totalBorrowed: r.totalBorrowed.toString(),
    availableLiquidity: r.availableLiquidity.toString(),
  }));
}

export async function fetchRwaUserReserves(
  user: string,
  provider?: Provider
): Promise<RwaUserReserveOnChain[]> {
  if (!isDeployed() && !user) return [];
  if (!isDeployed()) {
    return mockReserves().map((r) => ({
      asset: r.asset,
      supplied: '0',
      currentDebt: '0',
      usageAsCollateralEnabled: r.collateralEnabled,
    }));
  }
  const pool = getRwaPoolContract(provider || getRobinhoodProvider());
  const raw = await pool.getUserReservesData(user);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return raw.map((r: any) => ({
    asset: (r.asset as string).toLowerCase(),
    supplied: r.supplied.toString(),
    currentDebt: r.currentDebt.toString(),
    usageAsCollateralEnabled: r.usageAsCollateralEnabled as boolean,
  }));
}

export async function fetchRwaUserAccountData(user: string, provider?: Provider) {
  if (!isDeployed()) {
    return {
      totalCollateralBase: '0',
      totalDebtBase: '0',
      availableBorrowsBase: '0',
      currentLiquidationThreshold: '0',
      ltv: '0',
      healthFactor: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
    };
  }
  const pool = getRwaPoolContract(provider || getRobinhoodProvider());
  const data = await pool.getUserAccountData(user);
  return {
    totalCollateralBase: data.totalCollateralBase.toString(),
    totalDebtBase: data.totalDebtBase.toString(),
    availableBorrowsBase: data.availableBorrowsBase.toString(),
    currentLiquidationThreshold: data.currentLiquidationThreshold.toString(),
    ltv: data.ltv.toString(),
    healthFactor: data.healthFactor.toString(),
  };
}

// -------------------------------------------------- humanized (Aave shapes)

const RAY = '1000000000000000000000000000'; // 1e27

const bpsToRay = (bps: number): string =>
  EthersBigNumber.from(bps).mul(EthersBigNumber.from(10).pow(23)).toString(); // bps/1e4 * 1e27

export const reserveId = (asset: string) =>
  `${ChainId.robinhood_testnet}-${asset.toLowerCase()}-${RWA_POOL_ADDRESS}`;

/**
 * Maps an on-chain RWA reserve to the Aave "ReserveDataHumanized" shape that
 * formatReservesAndIncentives / the UI hooks consume. Since this market has no
 * a/debt tokens, both token addresses point at the underlying.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toReserveDataHumanized = (r: RwaReserveOnChain): any => ({
  id: reserveId(r.asset),
  underlyingAsset: r.asset,
  name: r.name,
  symbol: r.symbol,
  decimals: r.decimals,
  baseLTVasCollateral: r.ltv,
  reserveLiquidationThreshold: r.liquidationThreshold,
  reserveLiquidationBonus: (10000 + Number(r.liquidationBonus)).toString(),
  reserveFactor: '0',
  usageAsCollateralEnabled: r.collateralEnabled,
  borrowingEnabled: r.borrowingEnabled,
  stableBorrowRateEnabled: false,
  isActive: true,
  isFrozen: false,
  isPaused: false,
  isSiloedBorrowing: false,
  flashLoanEnabled: false,
  liquidityIndex: RAY,
  variableBorrowIndex: RAY,
  liquidityRate: bpsToRay(r.supplyRateBps),
  variableBorrowRate: bpsToRay(r.borrowRateBps),
  stableBorrowRate: '0',
  lastUpdateTimestamp: Math.floor(Date.now() / 1000),
  aTokenAddress: r.asset,
  variableDebtTokenAddress: r.asset,
  stableDebtTokenAddress: ZERO_ADDRESS,
  interestRateStrategyAddress: ZERO_ADDRESS,
  availableLiquidity: r.availableLiquidity,
  totalScaledVariableDebt: r.totalBorrowed,
  totalPrincipalStableDebt: '0',
  averageStableRate: '0',
  stableDebtLastUpdateTimestamp: 0,
  priceInMarketReferenceCurrency: r.priceUsd, // USD, 8 decimals
  priceOracle: RWA_POOL_ADDRESS,
  accruedToTreasury: '0',
  unbacked: '0',
  isolationModeTotalDebt: '0',
  debtCeiling: '0',
  debtCeilingDecimals: 2,
  eModeCategoryId: 0,
  borrowCap: '0',
  supplyCap: '0',
  borrowableInIsolation: false,
  // extra fields used by the morbit formatter
  totalSuppliedRaw: r.totalSupplied,
  supplyRateBps: r.supplyRateBps,
  borrowRateBps: r.borrowRateBps,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toUserReserveDataHumanized = (r: RwaUserReserveOnChain): any => ({
  id: `${ChainId.robinhood_testnet}-${r.asset}-${RWA_POOL_ADDRESS}`,
  underlyingAsset: r.asset,
  scaledATokenBalance: r.supplied,
  scaledVariableDebt: r.currentDebt,
  principalStableDebt: '0',
  stableBorrowRate: '0',
  stableBorrowLastUpdateTimestamp: 0,
  usageAsCollateralEnabledOnUser: r.usageAsCollateralEnabled,
});

export const RWA_BASE_CURRENCY_DATA = {
  marketReferenceCurrencyDecimals: 8,
  marketReferenceCurrencyPriceInUsd: '100000000', // 1 USD with 8 decimals
  networkBaseTokenPriceInUsd: '100000000',
  networkBaseTokenPriceDecimals: 8,
};
