import { useQueries, UseQueryOptions } from '@tanstack/react-query';
import { EmodeDataHumanized } from 'protocol/aave-compat';
import { MarketDataType } from 'ui-config/marketsConfig';
import { POLLING_INTERVAL, queryKeysFactory } from 'ui-config/queries';
import { useSharedDependencies } from 'ui-config/SharedDependenciesProvider';

import { HookOpts } from '../commonTypes';

export const usePoolsEModes = <T = EmodeDataHumanized[]>(
  marketsData: MarketDataType[],
  opts?: HookOpts<EmodeDataHumanized[], T>
) => {
  const { uiPoolService } = useSharedDependencies();
  return useQueries({
    queries: marketsData.map(
      (marketData) =>
        ({
          queryKey: queryKeysFactory.poolEModes(marketData),
          queryFn: () => uiPoolService.getEModesHumanized(marketData),
          refetchInterval: POLLING_INTERVAL,
          meta: {},
          ...opts,
        } as UseQueryOptions<EmodeDataHumanized[], Error, T>)
    ),
  });
};

export const usePoolEModes = (marketData: MarketDataType) => {
  return usePoolsEModes([marketData])[0];
};
