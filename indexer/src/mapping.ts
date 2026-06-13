import {
  BigInt,
  BigDecimal,
  Address,
  ethereum,
} from "@graphprotocol/graph-ts";
import {
  ReserveInitialized,
  PriceUpdated,
  Supply,
  Withdraw,
  Borrow,
  Repay,
  ReserveUsedAsCollateralEnabled,
  ReserveUsedAsCollateralDisabled,
  LiquidationCall,
} from "../generated/RWAPool/RWAPool";
import {
  Reserve,
  User,
  SupplyTransaction,
  WithdrawTransaction,
  BorrowTransaction,
  RepayTransaction,
  LiquidationTransaction,
} from "../generated/schema";

const ZERO = BigInt.fromI32(0);

function getOrCreateUser(address: Address, event: ethereum.Event): User {
  let id = address.toHexString();
  let user = User.load(id);
  if (!user) {
    user = new User(id);
    user.address = address;
    user.supplyCount = ZERO;
    user.borrowCount = ZERO;
    user.repayCount = ZERO;
    user.withdrawCount = ZERO;
    user.liquidationCount = ZERO;
    user.timestamp = event.block.timestamp;
    user.blockNumber = event.block.number;
  }
  return user;
}

function getOrCreateReserve(asset: Address, event: ethereum.Event): Reserve {
  let id = asset.toHexString();
  let reserve = Reserve.load(id);
  if (!reserve) {
    reserve = new Reserve(id);
    reserve.asset = asset;
    reserve.totalSupplied = ZERO;
    reserve.totalBorrowed = ZERO;
    reserve.totalLiquidity = ZERO;
    reserve.utilizationRate = BigDecimal.fromString("0");
    reserve.supplyCount = ZERO;
    reserve.borrowCount = ZERO;
    reserve.repayCount = ZERO;
    reserve.withdrawCount = ZERO;
    reserve.liquidationCount = ZERO;
    reserve.userCount = ZERO;
    reserve.timestamp = event.block.timestamp;
    reserve.blockNumber = event.block.number;
  }
  return reserve;
}

function toUtilizationRate(
  totalBorrowed: BigInt,
  totalSupplied: BigInt
): BigDecimal {
  if (totalSupplied.equals(ZERO)) return BigDecimal.fromString("0");
  return totalBorrowed.toBigDecimal().div(totalSupplied.toBigDecimal());
}

export function handleReserveInitialized(event: ReserveInitialized): void {
  let reserve = getOrCreateReserve(event.params.asset, event);
  reserve.timestamp = event.block.timestamp;
  reserve.blockNumber = event.block.number;
  reserve.save();
}

export function handlePriceUpdated(event: PriceUpdated): void {
  let reserve = getOrCreateReserve(event.params.asset, event);
  reserve.priceUsd = event.params.priceUsd;
  reserve.timestamp = event.block.timestamp;
  reserve.blockNumber = event.block.number;
  reserve.save();
}

export function handleSupply(event: Supply): void {
  let reserve = getOrCreateReserve(event.params.reserve, event);
  let user = getOrCreateUser(event.params.onBehalfOf, event);

  let tx = new SupplyTransaction(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  tx.transactionHash = event.transaction.hash;
  tx.logIndex = event.logIndex;
  tx.blockNumber = event.block.number;
  tx.timestamp = event.block.timestamp;
  tx.reserve = event.params.reserve;
  tx.user = event.params.user;
  tx.onBehalfOf = event.params.onBehalfOf;
  tx.amount = event.params.amount;
  tx.referralCode = event.params.referralCode;
  tx.save();

  reserve.totalSupplied = reserve.totalSupplied.plus(event.params.amount);
  reserve.totalLiquidity = reserve.totalLiquidity.plus(event.params.amount);
  reserve.utilizationRate = toUtilizationRate(
    reserve.totalBorrowed,
    reserve.totalSupplied
  );
  reserve.supplyCount = reserve.supplyCount.plus(BigInt.fromI32(1));
  reserve.timestamp = event.block.timestamp;
  reserve.blockNumber = event.block.number;

  user.supplyCount = user.supplyCount.plus(BigInt.fromI32(1));
  user.timestamp = event.block.timestamp;
  user.blockNumber = event.block.number;

  reserve.save();
  user.save();
}

export function handleWithdraw(event: Withdraw): void {
  let reserve = getOrCreateReserve(event.params.reserve, event);
  let user = getOrCreateUser(event.params.user, event);

  let tx = new WithdrawTransaction(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  tx.transactionHash = event.transaction.hash;
  tx.logIndex = event.logIndex;
  tx.blockNumber = event.block.number;
  tx.timestamp = event.block.timestamp;
  tx.reserve = event.params.reserve;
  tx.user = event.params.user;
  tx.to = event.params.to;
  tx.amount = event.params.amount;
  tx.save();

  reserve.totalSupplied = reserve.totalSupplied.minus(event.params.amount);
  reserve.totalLiquidity = reserve.totalLiquidity.minus(event.params.amount);
  reserve.utilizationRate = toUtilizationRate(
    reserve.totalBorrowed,
    reserve.totalSupplied
  );
  reserve.withdrawCount = reserve.withdrawCount.plus(BigInt.fromI32(1));
  reserve.timestamp = event.block.timestamp;
  reserve.blockNumber = event.block.number;

  user.withdrawCount = user.withdrawCount.plus(BigInt.fromI32(1));
  user.timestamp = event.block.timestamp;
  user.blockNumber = event.block.number;

  reserve.save();
  user.save();
}

export function handleBorrow(event: Borrow): void {
  let reserve = getOrCreateReserve(event.params.reserve, event);
  let user = getOrCreateUser(event.params.onBehalfOf, event);

  let tx = new BorrowTransaction(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  tx.transactionHash = event.transaction.hash;
  tx.logIndex = event.logIndex;
  tx.blockNumber = event.block.number;
  tx.timestamp = event.block.timestamp;
  tx.reserve = event.params.reserve;
  tx.user = event.params.user;
  tx.onBehalfOf = event.params.onBehalfOf;
  tx.amount = event.params.amount;
  tx.interestRateMode = event.params.interestRateMode;
  tx.borrowRate = event.params.borrowRate;
  tx.referralCode = event.params.referralCode;
  tx.save();

  reserve.totalBorrowed = reserve.totalBorrowed.plus(event.params.amount);
  reserve.utilizationRate = toUtilizationRate(
    reserve.totalBorrowed,
    reserve.totalSupplied
  );
  reserve.borrowCount = reserve.borrowCount.plus(BigInt.fromI32(1));
  reserve.timestamp = event.block.timestamp;
  reserve.blockNumber = event.block.number;

  user.borrowCount = user.borrowCount.plus(BigInt.fromI32(1));
  user.timestamp = event.block.timestamp;
  user.blockNumber = event.block.number;

  reserve.save();
  user.save();
}

export function handleRepay(event: Repay): void {
  let reserve = getOrCreateReserve(event.params.reserve, event);
  let user = getOrCreateUser(event.params.user, event);

  let tx = new RepayTransaction(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  tx.transactionHash = event.transaction.hash;
  tx.logIndex = event.logIndex;
  tx.blockNumber = event.block.number;
  tx.timestamp = event.block.timestamp;
  tx.reserve = event.params.reserve;
  tx.user = event.params.user;
  tx.repayer = event.params.repayer;
  tx.amount = event.params.amount;
  tx.useATokens = event.params.useATokens;
  tx.save();

  reserve.totalBorrowed = reserve.totalBorrowed.minus(event.params.amount);
  reserve.utilizationRate = toUtilizationRate(
    reserve.totalBorrowed,
    reserve.totalSupplied
  );
  reserve.repayCount = reserve.repayCount.plus(BigInt.fromI32(1));
  reserve.timestamp = event.block.timestamp;
  reserve.blockNumber = event.block.number;

  user.repayCount = user.repayCount.plus(BigInt.fromI32(1));
  user.timestamp = event.block.timestamp;
  user.blockNumber = event.block.number;

  reserve.save();
  user.save();
}

export function handleCollateralEnabled(
  event: ReserveUsedAsCollateralEnabled
): void {
  let reserve = getOrCreateReserve(event.params.reserve, event);
  reserve.collateralEnabled = true;
  reserve.timestamp = event.block.timestamp;
  reserve.blockNumber = event.block.number;
  reserve.save();
}

export function handleCollateralDisabled(
  event: ReserveUsedAsCollateralDisabled
): void {
  let reserve = getOrCreateReserve(event.params.reserve, event);
  reserve.collateralEnabled = false;
  reserve.timestamp = event.block.timestamp;
  reserve.blockNumber = event.block.number;
  reserve.save();
}

export function handleLiquidationCall(event: LiquidationCall): void {
  let reserve = getOrCreateReserve(event.params.collateralAsset, event);
  let user = getOrCreateUser(event.params.user, event);

  let tx = new LiquidationTransaction(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  tx.transactionHash = event.transaction.hash;
  tx.logIndex = event.logIndex;
  tx.blockNumber = event.block.number;
  tx.timestamp = event.block.timestamp;
  tx.collateralAsset = event.params.collateralAsset;
  tx.debtAsset = event.params.debtAsset;
  tx.user = event.params.user;
  tx.debtToCover = event.params.debtToCover;
  tx.liquidatedCollateralAmount = event.params.liquidatedCollateralAmount;
  tx.liquidator = event.params.liquidator;
  tx.receiveAToken = event.params.receiveAToken;
  tx.save();

  reserve.liquidationCount = reserve.liquidationCount.plus(BigInt.fromI32(1));
  reserve.timestamp = event.block.timestamp;
  reserve.blockNumber = event.block.number;

  user.liquidationCount = user.liquidationCount.plus(BigInt.fromI32(1));
  user.timestamp = event.block.timestamp;
  user.blockNumber = event.block.number;

  reserve.save();
  user.save();
}
