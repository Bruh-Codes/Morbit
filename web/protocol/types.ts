export enum ChainId {
  mainnet = 1,
  sepolia = 11155111,
  polygon = 137,
  avalanche = 43114,
  arbitrum_one = 42161,
  base = 8453,
  optimism = 10,
  gnosis = 100,
  xdai = 100,
  bnb = 56,
  scroll = 534352,
  zksync = 324,
  linea = 59144,
  sonic = 146,
  celo = 42220,
  metis_andromeda = 1088,
  soneium = 1868,
  ink = 57073,
  plasma = 28367,
  mantle = 5000,
  megaeth = 6342,
  xLayer = 196,
  // Testnets
  robinhood_testnet = 46630,
  fuji = 43113,
  arbitrum_sepolia = 421614,
  base_sepolia = 84532,
  optimism_sepolia = 11155420,
  scroll_sepolia = 534351,
}

export enum ProtocolAction {
  default = 'default',
  approval = 'approval',
  supply = 'supply',
  withdraw = 'withdraw',
  borrow = 'borrow',
  repay = 'repay',
  liquidationCall = 'liquidationCall',
  swapBorrowRate = 'swapBorrowRate',
  setUsageAsCollateral = 'setUsageAsCollateral',
  supplyWithPermit = 'supplyWithPermit',
  repayWithPermit = 'repayWithPermit',
}

export enum InterestRate {
  Stable = 'Stable',
  Variable = 'Variable',
}

export const API_ETH_MOCK_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export const USD_DECIMALS = 8;

export type BigNumberValue = string | number | bigint;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface FormatUserSummaryAndIncentivesResponse<_T = any> extends Record<string, any> {
  totalLiquidityUSD: string;
  totalCollateralUSD: string;
  totalBorrowsUSD: string;
  healthFactor: string;
  currentLiquidationThreshold: string;
  netWorthUSD: string;
  totalCollateralMarketReferenceCurrency: string;
  totalBorrowsMarketReferenceCurrency: string;
}

export interface ReserveData {
  id: string;
  underlyingToken: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoUrl: string;
  };
  supplyInfo: {
    apy: { value: number };
    total: { value: number; usd: number };
    supplyCap: { amount: { value: string } };
  };
  borrowInfo?: {
    apy: { value: number };
    total: { value: number; usd: number };
    borrowingState: 'ENABLED' | 'DISABLED';
    borrowCap: { amount: { value: string } };
    utilizationRate: { value: number };
  };
  isFrozen: boolean;
  isPaused: boolean;
  eModeInfo?: Array<{ canBeBorrowed: boolean }>;
  incentives: Record<string, unknown> | undefined;
  totalLiquidity: string;
  totalLiquidityUSD: string;
  availableLiquidity: string;
  availableLiquidityUSD: string;
  totalDebt: string;
  totalDebtUSD: string;
  priceInUSD: number;
}

export interface UserPosition {
  reserve: ReserveData;
  underlyingBalance: string;
  underlyingBalanceUSD: string;
  variableBorrows: string;
  variableBorrowsUSD: string;
  stableBorrows: string;
  stableBorrowsUSD: string;
  usageAsCollateralEnabledOnUser: boolean;
}

export type ReserveWithId = ReserveData;
