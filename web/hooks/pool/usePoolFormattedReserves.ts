import dayjs from 'dayjs';
import memoize from 'micro-memoize';
import {
  EmodeDataHumanized,
  formatReservesAndIncentives,
  ReserveDataHumanized,
  ReservesDataHumanized,
  ReservesIncentiveDataHumanized,
} from 'protocol/aave-compat';
import { reserveSortFn } from 'store/poolSelectors';
import { MarketDataType } from 'ui-config/marketsConfig';
import { fetchIconSymbolAndName, IconMapInterface } from 'ui-config/reservePatches';
import { getNetworkConfig, NetworkConfig } from 'utils/marketsAndNetworksConfig';

import { selectBaseCurrencyData, selectReserves } from './selectors';
import { usePoolsEModes } from './usePoolEModes';
import { usePoolsReservesHumanized } from './usePoolReserves';
import { usePoolsReservesIncentivesHumanized } from './usePoolReservesIncentives';
import { combineQueries, SimplifiedUseQueryResult } from './utils';

export type FormattedReservesAndIncentives = ReturnType<
  typeof formatReservesAndIncentives
>[number] &
  IconMapInterface & {
    isWrappedBaseAsset: boolean;
  } & ReserveDataHumanized;

const formatReserves = memoize(
  (
    reservesData: ReservesDataHumanized,
    incentivesData: ReservesIncentiveDataHumanized[],
    poolsEModesData: EmodeDataHumanized[],
    networkConfig: NetworkConfig
  ) => {
    const reserves = selectReserves(reservesData);
    const baseCurrencyData = selectBaseCurrencyData(reservesData);
    return formatReservesAndIncentives({
      reserves,
      currentTimestamp: dayjs().unix(),
      marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
      marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
      reserveIncentives: incentivesData,
      eModes: poolsEModesData,
    })
      .map((r: any) => ({
        ...r,
        ...fetchIconSymbolAndName(r),
        isWrappedBaseAsset:
          r.symbol.toLowerCase() === networkConfig.wrappedBaseAssetSymbol?.toLowerCase(),
      }))
      .sort(reserveSortFn);
  }
);

export const usePoolsFormattedReserves = (
  marketsData: MarketDataType[]
): SimplifiedUseQueryResult<FormattedReservesAndIncentives[]>[] => {
  const poolsReservesQueries = usePoolsReservesHumanized(marketsData);
  const poolsReservesIncentivesQueries = usePoolsReservesIncentivesHumanized(marketsData);
  const poolsEModesQueries = usePoolsEModes(marketsData);

  return poolsReservesQueries.map((poolReservesQuery, index) => {
    const marketData = marketsData[index];
    const poolReservesIncentivesQuery = poolsReservesIncentivesQueries[index];
    const poolEModesQuery = poolsEModesQueries[index];
    const networkConfig = getNetworkConfig(marketData.chainId);
    const selector = (
      reservesData: ReservesDataHumanized,
      incentivesData: ReservesIncentiveDataHumanized[],
      poolsEModesData: EmodeDataHumanized[]
    ) => {
      return formatReserves(reservesData, incentivesData, poolsEModesData, networkConfig);
    };
    return combineQueries(
      [poolReservesQuery, poolReservesIncentivesQuery, poolEModesQuery] as const,
      selector
    );
  });
};

export const usePoolFormattedReserves = (marketData: MarketDataType) => {
  return usePoolsFormattedReserves([marketData])[0];
};
