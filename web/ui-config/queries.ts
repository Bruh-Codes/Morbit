import { MarketDataType } from './marketsConfig';
import { TokenInfo } from './TokenList';

export const queryKeysFactory = {
  gho: ['gho'] as const,
  staking: ['staking'] as const,
  pool: ['pool'] as const,
  incentives: ['incentives'] as const,
  market: (marketData: MarketDataType) => [
    marketData.chainId,
    !!marketData.isFork,
    marketData.market,
  ],
  user: (user: string) => [user],
  transactionHistory: (user: string, marketData: MarketDataType) => [
    ...queryKeysFactory.user(user),
    ...queryKeysFactory.market(marketData),
    'transactionHistory',
  ],
  poolTokens: (user: string, marketData: MarketDataType) => [
    ...queryKeysFactory.pool,
    ...queryKeysFactory.user(user),
    ...queryKeysFactory.market(marketData),
    'poolTokens',
  ],
  poolReservesDataHumanized: (marketData: MarketDataType) => [
    ...queryKeysFactory.pool,
    ...queryKeysFactory.market(marketData),
    'poolReservesDataHumanized',
  ],
  userPoolReservesDataHumanized: (user: string, marketData: MarketDataType) => [
    ...queryKeysFactory.pool,
    ...queryKeysFactory.user(user),
    ...queryKeysFactory.market(marketData),
    'userPoolReservesDataHumanized',
  ],
  gasPrices: (chainId: number) => [chainId, 'gasPrices'],
  poolReservesIncentiveDataHumanized: (marketData: MarketDataType) => [
    ...queryKeysFactory.pool,
    ...queryKeysFactory.incentives,
    ...queryKeysFactory.market(marketData),
    'poolReservesIncentiveDataHumanized',
  ],
  userPoolReservesIncentiveDataHumanized: (user: string, marketData: MarketDataType) => [
    ...queryKeysFactory.pool,
    ...queryKeysFactory.incentives,
    ...queryKeysFactory.market(marketData),
    ...queryKeysFactory.user(user),
    'userPoolReservesIncentiveDataHumanized',
  ],
  poolApprovedAmount: (user: string, token: string, marketData: MarketDataType) => [
    ...queryKeysFactory.pool,
    ...queryKeysFactory.user(user),
    ...queryKeysFactory.market(marketData),
    token,
    'poolApprovedAmount',
  ],
  approvedAmount: (user: string, token: string, spender: string, chainId: number) => [
    ...queryKeysFactory.user(user),
    chainId,
    token,
    spender,
    'approvedAmount',
  ],
  tokensBalance: (tokenList: TokenInfo[], chainId: number, user: string) => [
    ...queryKeysFactory.user(user),
    tokenList.map((elem) => elem.address),
    chainId,
    'tokensBalance',
  ],
  poolEModes: (marketData: MarketDataType) => [
    ...queryKeysFactory.pool,
    ...queryKeysFactory.market(marketData),
    'poolEModes',
  ],
};

export const POLLING_INTERVAL = 60000;
