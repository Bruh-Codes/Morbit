// The production app normally gets these shapes from a generated SDK.
// In this workspace we keep the surface area explicit so the UI can compile.

export type TransactionHistoryItem<T = any> = T;
export type TransactionHistoryItemUnion = any;
export type UserTransactionItem = any;
export type HistoryFilters = any;
export type CowSwapSubset = any;
export type SwapActionFields = any;

export enum FilterOptions {
  SUPPLY = 'SUPPLY',
  BORROW = 'BORROW',
  WITHDRAW = 'WITHDRAW',
  REPAY = 'REPAY',
  RATECHANGE = 'RATECHANGE',
  COLLATERALCHANGE = 'COLLATERALCHANGE',
  LIQUIDATION = 'LIQUIDATION',
  SWAP = 'SWAP',
  COLLATERAL_SWAP = 'COLLATERAL_SWAP',
  DEBT_SWAP = 'DEBT_SWAP',
  REPAY_WITH_COLLATERAL = 'REPAY_WITH_COLLATERAL',
  WITHDRAW_AND_SWAP = 'WITHDRAW_AND_SWAP',
}

export enum ActionName {
  UserSupplyTransaction = 'UserSupplyTransaction',
  UserWithdrawTransaction = 'UserWithdrawTransaction',
  UserBorrowTransaction = 'UserBorrowTransaction',
  UserRepayTransaction = 'UserRepayTransaction',
  UserUsageAsCollateralTransaction = 'UserUsageAsCollateralTransaction',
  UserLiquidationCallTransaction = 'UserLiquidationCallTransaction',
  Swap = 'Swap',
  CollateralSwap = 'CollateralSwap',
  DebtSwap = 'DebtSwap',
  RepayWithCollateral = 'RepayWithCollateral',
  WithdrawAndSwap = 'WithdrawAndSwap',
}

export enum SwapType {
  Swap = 'Swap',
  CollateralSwap = 'CollateralSwap',
  DebtSwap = 'DebtSwap',
  RepayWithCollateral = 'RepayWithCollateral',
  WithdrawAndSwap = 'WithdrawAndSwap',
}

const swapActionNames = new Set<string>([
  ActionName.Swap,
  ActionName.CollateralSwap,
  ActionName.DebtSwap,
  ActionName.RepayWithCollateral,
  ActionName.WithdrawAndSwap,
]);

export const actionFilterMap = (action: ActionName | string) => String(action);

export const hasAmount = (transaction: any) => Boolean(transaction?.amount);
export const hasCollateralReserve = (transaction: any) => Boolean(transaction?.collateral);
export const hasPrincipalReserve = (transaction: any) => Boolean(transaction?.debtRepaid);
export const hasReserve = (transaction: any) => Boolean(transaction?.reserve);
export const hasSrcOrDestToken = (transaction: any) =>
  Boolean(transaction?.underlyingSrcToken && transaction?.underlyingDestToken);
export const isCowSwapSubset = (transaction: any) => hasSrcOrDestToken(transaction);
export const isSDKTransaction = (transaction: any) =>
  typeof transaction?.__typename === 'string' && transaction.__typename.startsWith('User');
export const isSwapTransaction = (transaction: any) =>
  swapActionNames.has(String(transaction?.action)) || isCowSwapSubset(transaction);

export const transactionHistoryItemTypeToSwapType = (action: ActionName | string) => {
  switch (String(action)) {
    case ActionName.Swap:
      return SwapType.Swap;
    case ActionName.CollateralSwap:
      return SwapType.CollateralSwap;
    case ActionName.DebtSwap:
      return SwapType.DebtSwap;
    case ActionName.RepayWithCollateral:
      return SwapType.RepayWithCollateral;
    case ActionName.WithdrawAndSwap:
      return SwapType.WithdrawAndSwap;
    default:
      return null;
  }
};

export const swapTypeToTransactionHistoryItemType = (swapType: SwapType | string) => {
  switch (String(swapType)) {
    case SwapType.Swap:
      return ActionName.Swap;
    case SwapType.CollateralSwap:
      return ActionName.CollateralSwap;
    case SwapType.DebtSwap:
      return ActionName.DebtSwap;
    case SwapType.RepayWithCollateral:
      return ActionName.RepayWithCollateral;
    case SwapType.WithdrawAndSwap:
      return ActionName.WithdrawAndSwap;
    default:
      return null;
  }
};
