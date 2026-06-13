import { useQuery } from '@tanstack/react-query';
import { AaveClient, chainId, evmAddress, markets, OrderDirection } from 'protocol/aave-compat';
import { MarketDataType } from 'ui-config/marketsConfig';
import { queryKeysFactory } from 'ui-config/queries';

type UseMarketsDataParams = {
  client: AaveClient;
  marketData: MarketDataType;
  account?: string | null;
};

export const useMarketsData = ({ client, marketData, account }: UseMarketsDataParams) => {
  const userAddress = account ? evmAddress(account) : undefined;
  const marketKey = [
    ...queryKeysFactory.market(marketData),
    ...queryKeysFactory.user(userAddress ?? 'anonymous'),
  ];

  return useQuery({
    queryKey: marketKey,
    enabled: !!client,
    queryFn: async () => {
      const response = await markets(client, {
        chainIds: [chainId(marketData.chainId)],
        user: userAddress,
        suppliesOrderBy: { tokenName: OrderDirection.Asc },
        borrowsOrderBy: { tokenName: OrderDirection.Asc },
      });

      if (response.isErr()) {
        throw response.error;
      }

      return response.value;
    },
  });
};
