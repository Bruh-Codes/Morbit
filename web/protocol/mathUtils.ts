import BigNumber from 'bignumber.js';

export const RAY = 10n ** 27n;
export const USD_DECIMALS = 8;

export function valueToBigNumber(value: BigNumber.Value): BigNumber {
  return new BigNumber(value);
}

export function normalize(value: BigNumber.Value, decimals: number): string {
  const bn = new BigNumber(value);
  return bn.div(new BigNumber(10).pow(decimals)).toString();
}

export function normalizeBN(value: BigNumber.Value, decimals: number): BigNumber {
  return new BigNumber(value).div(new BigNumber(10).pow(decimals));
}

export function rayDiv(a: BigNumber.Value, b: BigNumber.Value): BigNumber {
  const aBn = new BigNumber(a);
  const bBn = new BigNumber(b);
  return aBn.multipliedBy(RAY.toString()).div(bBn);
}

export function rayMul(a: BigNumber.Value, b: BigNumber.Value): BigNumber {
  const aBn = new BigNumber(a);
  const bBn = new BigNumber(b);
  return aBn.multipliedBy(bBn).div(RAY.toString());
}

export function formatReserves(reserves: unknown[]): unknown[] {
  return reserves;
}

/**
 * Computes the user summary (balances, USD totals, LTV, liquidation threshold,
 * health factor) from the humanized user reserves and the formatted reserves
 * produced by formatReservesAndIncentives. Base currency is USD, so
 * "MarketReferenceCurrency" values equal USD values.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function _formatUserSummaryAndIncentives(data: Record<string, any>): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userReserves: any[] = data.userReserves || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedReserves: any[] = data.formattedReserves || [];

  let totalLiquidityUSD = new BigNumber(0);
  let totalCollateralUSD = new BigNumber(0);
  let totalBorrowsUSD = new BigNumber(0);
  let weightedLtv = new BigNumber(0);
  let weightedLiquidationThreshold = new BigNumber(0);

  const userReservesData = userReserves
    .map((userReserve) => {
      const reserve = formattedReserves.find(
        (r) =>
          r.underlyingAsset?.toLowerCase() === userReserve.underlyingAsset?.toLowerCase()
      );
      if (!reserve) return null;

      const decimals = Number(reserve.decimals);
      const priceInUSD = new BigNumber(reserve.priceInUSD || 0);

      const underlyingBalance = normalizeBN(userReserve.scaledATokenBalance || '0', decimals);
      const underlyingBalanceUSD = underlyingBalance.multipliedBy(priceInUSD);
      const variableBorrows = normalizeBN(userReserve.scaledVariableDebt || '0', decimals);
      const variableBorrowsUSD = variableBorrows.multipliedBy(priceInUSD);

      totalLiquidityUSD = totalLiquidityUSD.plus(underlyingBalanceUSD);
      totalBorrowsUSD = totalBorrowsUSD.plus(variableBorrowsUSD);

      const isCollateral =
        reserve.usageAsCollateralEnabled && userReserve.usageAsCollateralEnabledOnUser;
      if (isCollateral && underlyingBalanceUSD.gt(0)) {
        totalCollateralUSD = totalCollateralUSD.plus(underlyingBalanceUSD);
        weightedLtv = weightedLtv.plus(
          underlyingBalanceUSD.multipliedBy(reserve.formattedBaseLTVasCollateral || 0)
        );
        weightedLiquidationThreshold = weightedLiquidationThreshold.plus(
          underlyingBalanceUSD.multipliedBy(reserve.formattedReserveLiquidationThreshold || 0)
        );
      }

      return {
        ...userReserve,
        id: reserve.id,
        reserve,
        underlyingAsset: userReserve.underlyingAsset,
        scaledATokenBalance: userReserve.scaledATokenBalance,
        scaledVariableDebt: userReserve.scaledVariableDebt,
        usageAsCollateralEnabledOnUser: userReserve.usageAsCollateralEnabledOnUser,
        underlyingBalance: underlyingBalance.toString(),
        underlyingBalanceUSD: underlyingBalanceUSD.toString(),
        underlyingBalanceMarketReferenceCurrency: underlyingBalanceUSD.toString(),
        variableBorrows: variableBorrows.toString(),
        variableBorrowsUSD: variableBorrowsUSD.toString(),
        variableBorrowsMarketReferenceCurrency: variableBorrowsUSD.toString(),
        stableBorrows: '0',
        stableBorrowsUSD: '0',
        stableBorrowsMarketReferenceCurrency: '0',
        totalBorrows: variableBorrows.toString(),
        totalBorrowsUSD: variableBorrowsUSD.toString(),
        totalBorrowsMarketReferenceCurrency: variableBorrowsUSD.toString(),
      };
    })
    .filter(Boolean);

  const currentLoanToValue = totalCollateralUSD.gt(0)
    ? weightedLtv.dividedBy(totalCollateralUSD)
    : new BigNumber(0);
  const currentLiquidationThreshold = totalCollateralUSD.gt(0)
    ? weightedLiquidationThreshold.dividedBy(totalCollateralUSD)
    : new BigNumber(0);

  const borrowingPowerUSD = totalCollateralUSD.multipliedBy(currentLoanToValue);
  const availableBorrowsUSD = BigNumber.max(borrowingPowerUSD.minus(totalBorrowsUSD), 0);

  const healthFactor = totalBorrowsUSD.gt(0)
    ? totalCollateralUSD.multipliedBy(currentLiquidationThreshold).dividedBy(totalBorrowsUSD)
    : new BigNumber(-1);

  const netWorthUSD = totalLiquidityUSD.minus(totalBorrowsUSD);

  return {
    userReservesData,
    totalLiquidityUSD: totalLiquidityUSD.toString(),
    totalLiquidityMarketReferenceCurrency: totalLiquidityUSD.toString(),
    totalCollateralUSD: totalCollateralUSD.toString(),
    totalCollateralMarketReferenceCurrency: totalCollateralUSD.toString(),
    totalBorrowsUSD: totalBorrowsUSD.toString(),
    totalBorrowsMarketReferenceCurrency: totalBorrowsUSD.toString(),
    netWorthUSD: netWorthUSD.toString(),
    availableBorrowsUSD: availableBorrowsUSD.toString(),
    availableBorrowsMarketReferenceCurrency: availableBorrowsUSD.toString(),
    currentLoanToValue: currentLoanToValue.toString(),
    currentLiquidationThreshold: currentLiquidationThreshold.toString(),
    healthFactor: healthFactor.toString(),
    isInIsolationMode: false,
    isolatedReserve: undefined,
    calculatedUserIncentives: {},
    userEmodeCategoryId: data.userEmodeCategoryId || 0,
    isInEmode: false,
  };
}

export function formatUserSummaryAndIncentives(
  data: Record<string, unknown>
): Record<string, unknown> {
  return data;
}
