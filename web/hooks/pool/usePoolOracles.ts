import {
  API_ETH_MOCK_ADDRESS,
  normalize,
  ReservesDataHumanized,
  ReservesIncentiveDataHumanized,
  USD_DECIMALS,
} from 'protocol/aave-compat';
import { useRootStore } from 'store/root';
import { MarketDataType } from 'ui-config/marketsConfig';
import { NetworkConfig } from 'ui-config/networksConfig';

import { usePoolReservesHumanized } from './usePoolReserves';
import { usePoolReservesIncentivesHumanized } from './usePoolReservesIncentives';
import { combineQueries } from './utils';

export type PoolOracles = Record<string, ReserveOracle>;

export interface ReserveOracle {
  priceInUSD: string;
  formattedPriceInUSD: string;
  address: string;
}

const formatOracleData = (
  pool: ReservesDataHumanized,
  incentives: ReservesIncentiveDataHumanized[],
  networkConfig: NetworkConfig
) => {
  const oracles: PoolOracles = {};
  pool.reservesData.forEach(
    (reserve: {
      underlyingAsset: string;
      priceInMarketReferenceCurrency: string;
      priceOracle: string;
      symbol: string;
    }) => {
      oracles[reserve.underlyingAsset] = {
        priceInUSD: reserve.priceInMarketReferenceCurrency,
        formattedPriceInUSD: normalize(reserve.priceInMarketReferenceCurrency, USD_DECIMALS),
        address: reserve.priceOracle,
      };
      if (networkConfig.wrappedBaseAssetSymbol === reserve.symbol) {
        oracles[API_ETH_MOCK_ADDRESS.toLowerCase()] = oracles[reserve.underlyingAsset];
      }
    }
  );
  incentives.forEach((incentive) => {
    incentive.aIncentiveData.rewardsTokenInformation.forEach(
      (reward: {
        rewardTokenAddress: string;
        rewardPriceFeed: string;
        rewardTokenDecimals: number;
        priceFeedDecimals: number;
        rewardOracleAddress: string;
      }) => {
        if (oracles[reward.rewardTokenAddress]) return;
        oracles[reward.rewardTokenAddress] = {
          priceInUSD: reward.rewardPriceFeed,
          formattedPriceInUSD: normalize(reward.rewardPriceFeed, reward.priceFeedDecimals),
          address: reward.rewardOracleAddress,
        };
      }
    );
    incentive.vIncentiveData.rewardsTokenInformation.forEach(
      (reward: {
        rewardTokenAddress: string;
        rewardPriceFeed: string;
        priceFeedDecimals: number;
        rewardOracleAddress: string;
      }) => {
        if (oracles[reward.rewardTokenAddress]) return;
        oracles[reward.rewardTokenAddress] = {
          priceInUSD: reward.rewardPriceFeed,
          formattedPriceInUSD: normalize(reward.rewardPriceFeed, reward.priceFeedDecimals),
          address: reward.rewardOracleAddress,
        };
      }
    );
  });
  return oracles;
};

export const usePoolOracles = (marketData: MarketDataType) => {
  const networkConfig = useRootStore((store) => store.currentNetworkConfig);

  const selector = (pool: ReservesDataHumanized, incentives: ReservesIncentiveDataHumanized[]) => {
    return formatOracleData(pool, incentives, networkConfig);
  };

  const poolQuery = usePoolReservesHumanized(marketData);
  const incentivesQuery = usePoolReservesIncentivesHumanized(marketData);

  return combineQueries([poolQuery, incentivesQuery] as const, selector);
};
