// Replaces @aave/contract-helpers, @aave/math-utils, @aave/react, @aave/graphql
// with implementations backed by the Morbit RWAPool on Robinhood Chain Testnet.
// Anything not needed for the RWA MVP stays stubbed.

import { BigNumber as EthersBigNumber, constants, utils as ethersUtils } from 'ethers';

import {
  erc20Interface,
  fetchRwaReserves,
  fetchRwaUserAccountData,
  fetchRwaUserReserves,
  getErc20Contract,
  getFallbackProvider,
  getPoolAddress,
  reserveId,
  RWA_BASE_CURRENCY_DATA,
  rwaPoolInterface,
  toReserveDataHumanized,
  toUserReserveDataHumanized,
  ZERO_ADDRESS,
} from './rwaContracts';
import { getDeployment, setDeployment } from './currentDeployment';
import robinhoodDeployment from '../ui-config/robinhoodDeployment.json';
import arbitrumDeployment from '../ui-config/arbitrumDeployment.json';
import { rwaTokens } from './rwaTokens';
import {
  normalize as normalizeLocal,
  USD_DECIMALS as USD_DECIMALS_LOCAL,
  valueToBigNumber as valueToBigNumberLocal,
  valueToBigNumber,
} from './mathUtils';
import { ChainId } from './types';

export {
  _formatUserSummaryAndIncentives,
  formatUserSummaryAndIncentives,
  normalize,
  normalizeBN,
  RAY,
  rayDiv,
  rayMul,
  USD_DECIMALS,
  valueToBigNumber,
} from './mathUtils';
export type { BigNumberValue, FormatUserSummaryAndIncentivesResponse } from './types';
export { API_ETH_MOCK_ADDRESS, ChainId, InterestRate, ProtocolAction } from './types';

// V3 PoolBundle: synchronous tx-data builders used by the Supply / Borrow /
// Repay flows. All amounts arrive already parsed to wei by the modals
// (or '-1' for max on repay). Encodes against the Aave-V3-compatible RWAPool.
export class PoolBundle {
  [key: string]: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(provider?: any, config?: { POOL?: string; [key: string]: any }) {
    const poolAddress = (config?.POOL || getPoolAddress()) as string;
    const boundProvider = provider || getFallbackProvider();

    const buildTx = (user: string, data: string) => ({
      to: poolAddress,
      from: user,
      data,
      value: EthersBigNumber.from(0),
    });

    const getApprovedAmount = async ({ user, token }: { user: string; token: string }) => {
      const erc20 = getErc20Contract(token, boundProvider);
      const [allowance, decimals] = await Promise.all([
        erc20.allowance(user, poolAddress),
        erc20.decimals(),
      ]);
      const amount = EthersBigNumber.from(allowance).eq(constants.MaxUint256)
        ? '-1'
        : ethersUtils.formatUnits(allowance, decimals);
      return { user, token, spender: poolAddress, amount };
    };

    this.supplyTxBuilder = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      generateTxData: ({ user, reserve, amount }: any) =>
        buildTx(user, rwaPoolInterface.encodeFunctionData('supply', [reserve, amount, user, 0])),
      generateSignedTxData: () => {
        throw new Error('Permit is not supported in the Morbit RWA market');
      },
      getApprovedAmount,
    };

    this.borrowTxBuilder = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      generateTxData: ({ user, reserve, amount }: any) =>
        buildTx(
          user,
          rwaPoolInterface.encodeFunctionData('borrow', [reserve, amount, 2, 0, user])
        ),
      encodeBorrowParams: () => {
        throw new Error('L2 encoding is not supported in the Morbit RWA market');
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const repayTxData = ({ user, reserve, amount }: any) => {
      const amountWei = amount === '-1' ? constants.MaxUint256 : amount;
      return buildTx(
        user,
        rwaPoolInterface.encodeFunctionData('repay', [reserve, amountWei, 2, user])
      );
    };

    this.repayTxBuilder = {
      generateTxData: repayTxData,
      generateSignedTxData: () => {
        throw new Error('Permit is not supported in the Morbit RWA market');
      },
      encodeRepayWithPermitParams: () => {
        throw new Error('Permit is not supported in the Morbit RWA market');
      },
      encodeRepayParams: () => {
        throw new Error('L2 encoding is not supported in the Morbit RWA market');
      },
      getApprovedAmount,
    };

    // No aTokens in this market — repaying "with aTokens" is plain repay.
    this.repayWithATokensTxBuilder = {
      generateTxData: repayTxData,
      encodeRepayWithATokensParams: () => {
        throw new Error('L2 encoding is not supported in the Morbit RWA market');
      },
    };
  }
}
export class PoolBundleInterface {
  [key: string]: any;
  constructor(..._args: any[]) {}
}
export class LendingPoolBundle {
  [key: string]: any;
  constructor(..._args: any[]) {}
}
export class LendingPoolBundleInterface {
  [key: string]: any;
  constructor(..._args: any[]) {}
}

// Real ERC20 helper backed by the connected chain.
export const ERC20Service = class {
  [key: string]: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(provider?: any) {
    this.provider = provider || getFallbackProvider();
    // poolSlice destructures { getTokenData } from instances
    this.getTokenData = this.getTokenData.bind(this);
  }
  async getTokenData(address: string): Promise<any> {
    const erc20 = getErc20Contract(address, this.provider);
    const [name, symbol, decimals] = await Promise.all([
      erc20.name(),
      erc20.symbol(),
      erc20.decimals(),
    ]);
    return { address, name, symbol, decimals: Number(decimals) };
  }
  async decimalsOf(token: string): Promise<number> {
    return Number(await getErc20Contract(token, this.provider).decimals());
  }
  /** Spender allowance normalized to token units, or -1 for max approval. */
  async approvedAmount({
    user,
    token,
    spender,
  }: {
    user: string;
    token: string;
    spender: string;
  }): Promise<number> {
    const erc20 = getErc20Contract(token, this.provider);
    const [allowance, decimals] = await Promise.all([
      erc20.allowance(user, spender),
      erc20.decimals(),
    ]);
    if (EthersBigNumber.from(allowance).eq(constants.MaxUint256)) return -1;
    return Number(ethersUtils.formatUnits(allowance, decimals));
  }
  /** Builds a raw approve() transaction. Amount is expected in wei. */
  approveTxData({
    user,
    token,
    spender,
    amount,
  }: {
    user: string;
    token: string;
    spender: string;
    amount: string;
  }): any {
    return {
      to: token,
      from: user,
      data: erc20Interface.encodeFunctionData('approve', [spender, amount]),
      value: EthersBigNumber.from(0),
    };
  }
};

// Reads wallet balances straight from the ERC20s registered in the RWAPool.
export const WalletBalanceProvider = class {
  [key: string]: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(args?: { walletBalanceProviderAddress?: string; provider?: any; chainId?: number }) {
    this.provider = args?.provider || getFallbackProvider();
    const cid = args?.chainId;
    if (cid === ChainId.robinhood_testnet || (!cid && getDeployment()?.chainId !== ChainId.arbitrum_sepolia)) {
      setDeployment(robinhoodDeployment);
    } else if (cid === ChainId.arbitrum_sepolia) {
      setDeployment(arbitrumDeployment);
    }
  }
  async batchBalanceOf(users: string[], tokens: string[], _options?: any): Promise<any[]> {
    const user = users[0];
    return Promise.all(
      tokens.map(async (token) => {
        try {
          if (!token || token === ZERO_ADDRESS) return EthersBigNumber.from(0);
          return await getErc20Contract(token, this.provider).balanceOf(user);
        } catch {
          return EthersBigNumber.from(0);
        }
      })
    );
  }
  async getUserWalletBalancesForLendingPoolProvider(
    user: string,
    _lendingPoolAddressProvider: string
  ): Promise<any> {
    const reserves = await fetchRwaReserves(this.provider);
    const tokens = reserves.map((r) => r.asset);
    const balances = await this.batchBalanceOf([user], tokens);
    return { 0: tokens, 1: balances };
  }
  async getUserWalletBalances(user: string, tokens: string[]): Promise<any> {
    return this.batchBalanceOf([user], tokens);
  }
};

export const UiIncentiveDataProvider = class {
  [key: string]: any;
  constructor(..._args: any[]) {}
  async getIncentivesData(..._args: any[]): Promise<any> {
    return [];
  }
};

// Reads reserve + user data from the RWAPool's aggregated views.
export const UiPoolDataProvider = class {
  [key: string]: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(args?: { uiPoolDataProviderAddress?: string; provider?: any; chainId?: number }) {
    this.provider = args?.provider || getFallbackProvider();
    const cid = args?.chainId;
    if (cid === ChainId.robinhood_testnet || (!cid && getDeployment()?.chainId !== ChainId.arbitrum_sepolia)) {
      setDeployment(robinhoodDeployment);
    } else if (cid === ChainId.arbitrum_sepolia) {
      setDeployment(arbitrumDeployment);
    }
  }
  async getReservesHumanized(..._args: any[]): Promise<any> {
    const reserves = await fetchRwaReserves(this.provider);
    return {
      baseCurrencyData: { ...RWA_BASE_CURRENCY_DATA },
      reservesData: reserves.map(toReserveDataHumanized),
    };
  }
  async getUserReservesHumanized({ user }: { user: string; lendingPoolAddressProvider?: string }): Promise<any> {
    const userReserves = await fetchRwaUserReserves(user, this.provider);
    return {
      userReserves: userReserves.map(toUserReserveDataHumanized),
      userEmodeCategoryId: 0,
    };
  }
  async getEModesHumanized(..._args: any[]): Promise<any> {
    return [];
  }
};

export const AaveTokenV3Service = class {
  [key: string]: any;
  constructor(..._args: any[]) {}
  async getEip712Domain(..._args: any[]): Promise<any> {
    return {
      name: 'RWA',
      version: '1',
      chainId: 1,
      verifyingContract: '0x0000000000000000000000000000000000000000',
    };
  }
  async getNonce(..._args: any[]): Promise<any> {
    return 0;
  }
};

export const MetaDelegateHelperService = class {
  [key: string]: any;
  constructor(..._args: any[]) {}
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApproveType = any;
export const ApproveType = {
  SUPPLY: 'supply',
  BORROW: 'borrow',
  REPAY: 'repay',
  WITHDRAW: 'withdraw',
};

// ---- Replacements for @aave/react ----
export enum TimeWindow {
  LastWeek = '7d',
  LastMonth = '30d',
  LastSixMonths = '180d',
  LastYear = '365d',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useReserveRatesHistory = (..._args: any[]): any => ({
  data: [],
  loading: false,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useReservesHistory = (..._args: any[]): any => ({
  data: [],
  loading: false,
});

// ---- Replacements for @aave-dao/aave-address-book ----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeMarket = (): any => {
  const assets = new Proxy({} as Record<string, { UNDERLYING: string }>, {
    get(target, prop) {
      if (!(prop in target)) {
        target[prop as string] = { UNDERLYING: '0x0000000000000000000000000000000000000000' };
      }
      return target[prop as string];
    },
  });
  return {
    ASSETS: assets,
    POOL_ADDRESSES_PROVIDER: '0x0000000000000000000000000000000000000000',
    POOL: '0x0000000000000000000000000000000000000000',
    WETH_GATEWAY: '0x0000000000000000000000000000000000000000',
    REPAY_WITH_COLLATERAL_ADAPTER: '0x0000000000000000000000000000000000000000',
    SWAP_COLLATERAL_ADAPTER: '0x0000000000000000000000000000000000000000',
    WALLET_BALANCE_PROVIDER: '0x0000000000000000000000000000000000000000',
    UI_POOL_DATA_PROVIDER: '0x0000000000000000000000000000000000000000',
    UI_INCENTIVE_DATA_PROVIDER: '0x0000000000000000000000000000000000000000',
    COLLECTOR: '0x0000000000000000000000000000000000000000',
    MIGRATION_HELPER: '0x0000000000000000000000000000000000000000',
    DEBT_SWAP_ADAPTER: '0x0000000000000000000000000000000000000000',
    WITHDRAW_SWAP_ADAPTER: '0x0000000000000000000000000000000000000000',
    L2_ENCODER: '0x0000000000000000000000000000000000000000',
    GHO_TOKEN: '0x0000000000000000000000000000000000000000',
    FAUCET: '0x0000000000000000000000000000000000000000',
    STK_AAVE: '0x0000000000000000000000000000000000000000',
  };
};

const createEmptyMarket = makeMarket;
export const AaveV3Arbitrum = createEmptyMarket();
export const AaveV3Avalanche = createEmptyMarket();
export const AaveV3Base = createEmptyMarket();
export const AaveV3BaseSepolia = createEmptyMarket();
export const AaveV3BNB = createEmptyMarket();
export const AaveV3Celo = createEmptyMarket();
export const AaveV3EthereumEtherFi = createEmptyMarket();
export const AaveV3EthereumHorizon = createEmptyMarket();
export const AaveV3EthereumLido = createEmptyMarket();
export const AaveV3Gnosis = createEmptyMarket();
export const AaveV3InkWhitelabel = createEmptyMarket();
export const AaveV3Linea = createEmptyMarket();
export const AaveV3Mantle = createEmptyMarket();
export const AaveV3MegaEth = createEmptyMarket();
export const AaveV3Metis = createEmptyMarket();
export const AaveV3Optimism = createEmptyMarket();
export const AaveV3Plasma = createEmptyMarket();
export const AaveV3Polygon = createEmptyMarket();
export const AaveV3Scroll = createEmptyMarket();
export const AaveV3Soneium = createEmptyMarket();
export const AaveV3Sonic = createEmptyMarket();
export const AaveV3XLayer = createEmptyMarket();
export const AaveV3ZkSync = createEmptyMarket();
export const GhoAvalanche = createEmptyMarket();
export const GhoGnosis = createEmptyMarket();
export const GhoMantle = createEmptyMarket();
export const GhoPlasma = createEmptyMarket();

export const AaveSafetyModule = makeMarket();
export const AaveV3Ethereum = makeMarket();

// ---- Replacements for @aave/graphql types ----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Market = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Reserve = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MarketUserState = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EmodeMarketCategory = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UserSupplyTransaction = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UserBorrowTransaction = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UserRepayTransaction = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UserLiquidationCallTransaction = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UserTransactionItem = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UserUsageAsCollateralTransaction = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UserWithdrawTransaction = any;

// ---- Replacement for @aave/client ----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AaveClient = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComputedUserReserve<_T = any> = any;
export function chainId(id: number) {
  return id;
}
export function evmAddress(addr: string) {
  return addr;
}
export enum OrderDirection {
  Asc = 'asc',
  ASC = 'asc',
  Desc = 'desc',
  DESC = 'desc',
}

// ---- Additional types from @aave/contract-helpers ----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UserReservesIncentivesDataHumanized = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReservesDataHumanized = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EmodeDataHumanized = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type transactionType = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PERMISSION: any = {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PermissionManager = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Stake = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultGasRecommendation = {
  recommended: '450000',
  limit: '450000',
  suggestedMaxFeePerGas: '0',
  suggestedMaxPriorityFeePerGas: '0',
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const gasLimitRecommendations: any = new Proxy(
  {},
  { get: () => defaultGasRecommendation }
);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const valueToWei = (..._args: any[]): any => '0';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const synthetixProxyByChainId: any = {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ChainIdToNetwork: any = {};

// ---- Additional types from @aave/math-utils ----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UserIncentiveData = any;
// Formats humanized RWA reserves (from rwaContracts.toReserveDataHumanized)
// into the rich shape the UI consumes everywhere (USD values, APYs, ratios).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatReservesAndIncentives = ({ reserves }: any = {}): any => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (reserves || []).map((r: any) => {
    const decimals = Number(r.decimals);
    const priceInUSD = valueToBigNumberLocal(r.priceInMarketReferenceCurrency).shiftedBy(
      -USD_DECIMALS_LOCAL
    );
    const totalLiquidity = valueToBigNumberLocal(r.totalSuppliedRaw || '0').shiftedBy(-decimals);
    const availableLiquidity = valueToBigNumberLocal(r.availableLiquidity || '0').shiftedBy(
      -decimals
    );
    const totalDebt = valueToBigNumberLocal(r.totalScaledVariableDebt || '0').shiftedBy(-decimals);
    const supplyAPY = valueToBigNumberLocal(r.supplyRateBps || 0).dividedBy(10000);
    const borrowAPY = valueToBigNumberLocal(r.borrowRateBps || 0).dividedBy(10000);
    const borrowUsageRatio = totalLiquidity.gt(0)
      ? totalDebt.dividedBy(totalLiquidity)
      : valueToBigNumberLocal(0);

    return {
      ...r,
      // amounts (token units)
      totalLiquidity: totalLiquidity.toString(),
      formattedAvailableLiquidity: availableLiquidity.toString(),
      unborrowedLiquidity: availableLiquidity.toString(),
      totalDebt: totalDebt.toString(),
      totalVariableDebt: totalDebt.toString(),
      totalStableDebt: '0',
      // prices
      priceInUSD: priceInUSD.toString(),
      formattedPriceInMarketReferenceCurrency: priceInUSD.toString(),
      // USD values
      totalLiquidityUSD: totalLiquidity.multipliedBy(priceInUSD).toString(),
      availableLiquidityUSD: availableLiquidity.multipliedBy(priceInUSD).toString(),
      totalDebtUSD: totalDebt.multipliedBy(priceInUSD).toString(),
      totalVariableDebtUSD: totalDebt.multipliedBy(priceInUSD).toString(),
      totalStableDebtUSD: '0',
      borrowCapUSD: '0',
      supplyCapUSD: '0',
      unbackedUSD: '0',
      // rates
      supplyAPY: supplyAPY.toString(),
      supplyAPR: supplyAPY.toString(),
      variableBorrowAPY: borrowAPY.toString(),
      variableBorrowAPR: borrowAPY.toString(),
      stableBorrowAPY: '0',
      stableBorrowAPR: '0',
      // risk params (formatted to 0-1 decimals)
      formattedBaseLTVasCollateral: valueToBigNumberLocal(r.baseLTVasCollateral || '0')
        .dividedBy(10000)
        .toString(),
      formattedReserveLiquidationThreshold: valueToBigNumberLocal(
        r.reserveLiquidationThreshold || '0'
      )
        .dividedBy(10000)
        .toString(),
      formattedReserveLiquidationBonus: valueToBigNumberLocal(r.reserveLiquidationBonus || '10000')
        .minus(10000)
        .dividedBy(10000)
        .toString(),
      formattedEModeLtv: '0',
      formattedEModeLiquidationThreshold: '0',
      formattedEModeLiquidationBonus: '0',
      // usage
      borrowUsageRatio: borrowUsageRatio.toString(),
      supplyUsageRatio: borrowUsageRatio.toString(),
      utilizationRate: borrowUsageRatio.toString(),
      // isolation / e-mode / incentives — unused in this market
      isIsolated: false,
      isolationModeTotalDebt: '0',
      isolationModeTotalDebtUSD: '0',
      availableDebtCeilingUSD: '0',
      debtCeilingUSD: '0',
      eModes: [],
      aIncentivesData: [],
      vIncentivesData: [],
      sIncentivesData: [],
    };
  });
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const nativeToUSD = (..._args: any[]): any => '0';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UserReserveData = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatUserSummary = (..._args: any[]): any => ({
  totalLiquidityUSD: '0',
  totalBorrowsUSD: '0',
  healthFactor: '1',
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const calculateHealthFactorFromBalancesBigUnits = (..._args: any[]): any => {
  const { collateralBalanceMarketReferenceCurrency, borrowBalanceMarketReferenceCurrency, currentLiquidationThreshold } = _args[0] || {};
  const collateral = Number(collateralBalanceMarketReferenceCurrency || 0);
  const debt = Number(borrowBalanceMarketReferenceCurrency || 0);
  const liqThreshold = Number(currentLiquidationThreshold || 0);
  if (debt === 0) return valueToBigNumber('115792089237316195423570985008687907853269984665640564039457584007913129639935');
  const hf = (collateral * liqThreshold) / (debt * 10000);
  return valueToBigNumber(hf.toString());
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReserveIncentiveResponse = any;

function generateMockApyHistory(window: any): any[] {
  const now = Date.now();
  const windowMs: Record<string, number> = {
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '180d': 180 * 24 * 60 * 60 * 1000,
    '365d': 365 * 24 * 60 * 60 * 1000,
  };
  const duration = windowMs[String(window)] || windowMs['7d'];
  const points = 30;
  const interval = duration / points;
  const base = 2 + Math.random() * 5;
  return Array.from({ length: points }, (_, i) => ({
    date: new Date(now - duration + i * interval).toISOString(),
    avgRate: {
      value: (base + Math.sin(i * 0.4) * 1.2 + (Math.random() - 0.5) * 0.8).toFixed(4),
      __typename: 'BigDecimal',
    },
    __typename: 'ReserveSubset',
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useBorrowAPYHistory = (..._args: any[]): any => ({
  data: generateMockApyHistory(_args[0]?.window),
  loading: false,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useSupplyAPYHistory = (..._args: any[]): any => ({
  data: generateMockApyHistory(_args[0]?.window),
  loading: false,
});

// ---- Additional from @aave/react ----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useUserMeritRewards = (..._args: any[]): any => ({ data: null, loading: false });

// ---- from @aave/client/actions ----
// Builds the SDK-style market snapshot (supplyReserves / borrowReserves /
// userState) straight from the RWAPool on Robinhood Chain Testnet.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const markets = async (_client: any, args?: any): Promise<any> => {
  try {
    const user: string | undefined = args?.user;
    const [reserves, userAccountData] = await Promise.all([
      fetchRwaReserves().catch(() =>
        // fallback to mock so the UI always has asset data
        mockMarketsReserves()
      ),
      user ? fetchRwaUserAccountData(user).catch(() => null) : Promise.resolve(null),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toUiReserve = (r: any) => {
      const priceUsd = valueToBigNumberLocal(r.priceUsd).shiftedBy(-USD_DECIMALS_LOCAL).toNumber();
      const totalSupplied = Number(normalizeLocal(r.totalSupplied, r.decimals));
      const totalBorrowed = Number(normalizeLocal(r.totalBorrowed, r.decimals));
      const availableLiquidity = Number(normalizeLocal(r.availableLiquidity, r.decimals));
      const underlyingAddress = r.asset;
      const ltv = Number(r.ltv);
      const liquidationThreshold = Number(r.liquidationThreshold);
      const liquidationBonus = Number(r.liquidationBonus);
      const totalUsd = totalSupplied * priceUsd;
      return {
        id: reserveId(underlyingAddress),
        underlyingToken: {
          address: underlyingAddress,
          symbol: r.symbol,
          name: r.name,
          decimals: r.decimals,
          logoUrl: '',
        },
        aToken: {
          address: underlyingAddress,
          symbol: `a${r.symbol}`,
          name: `Aave RWA ${r.name}`,
          decimals: r.decimals,
        },
        vToken: {
          address: underlyingAddress,
          symbol: `variableDebt${r.symbol}`,
          name: `Aave RWA Variable Debt ${r.name}`,
          decimals: r.decimals,
        },
        sToken: {
          address: underlyingAddress,
          symbol: `stableDebt${r.symbol}`,
          name: `Aave RWA Stable Debt ${r.name}`,
          decimals: r.decimals,
        },
        usageAsCollateralEnabled: r.collateralEnabled,
        size: { usd: totalUsd, amount: { value: totalSupplied } },
        supplyInfo: {
          apy: { value: r.supplyRateBps / 100 },
          total: { value: totalSupplied, usd: totalUsd },
          supplyCap: { amount: { value: '0' }, usd: 0 },
          maxLTV: { value: String(ltv) },
          liquidationThreshold: { value: String(liquidationThreshold) },
          liquidationBonus: { value: String(liquidationBonus) },
        },
        borrowInfo: r.borrowingEnabled
          ? {
              apy: { value: r.borrowRateBps / 100 },
              total: { amount: { value: String(totalBorrowed) }, usd: totalBorrowed * priceUsd },
              borrowingState: 'ENABLED',
              borrowCap: { amount: { value: '0' } },
              utilizationRate: {
                value: totalSupplied > 0 ? (totalBorrowed / totalSupplied) * 100 : 0,
              },
            }
          : undefined,
        isFrozen: false,
        isPaused: false,
        eModeInfo: [],
        incentives: undefined,
        isolationModeConfig: undefined,
        totalLiquidity: String(totalSupplied),
        totalLiquidityUSD: String(totalUsd),
        availableLiquidity: String(availableLiquidity),
        availableLiquidityUSD: String(availableLiquidity * priceUsd),
        totalDebt: String(totalBorrowed),
        totalDebtUSD: String(totalBorrowed * priceUsd),
        priceInUSD: priceUsd,
      };
    };

    const uiReserves = reserves.map(toUiReserve);

    let userState;
    if (userAccountData) {
      const totalCollateralUsd = Number(
        normalizeLocal(userAccountData.totalCollateralBase, USD_DECIMALS_LOCAL)
      );
      const totalDebtUsd = Number(normalizeLocal(userAccountData.totalDebtBase, USD_DECIMALS_LOCAL));
      const hasDebt = totalDebtUsd > 0;
      userState = {
        netWorth: String(totalCollateralUsd - totalDebtUsd),
        healthFactor: hasDebt
          ? normalizeLocal(userAccountData.healthFactor, 18)
          : null,
        eModeEnabled: false,
        eModeCategoryId: 0,
      };
    }

    const totalMarketSize = uiReserves.reduce(
      (sum: number, r: any) => sum + Number(r.totalLiquidityUSD || 0),
      0
    );
    const totalAvailableLiquidity = uiReserves.reduce(
      (sum: number, r: any) => sum + Number(r.availableLiquidityUSD || 0),
      0
    );

    const dep = getPoolAddress();
    const chainId = ChainId.robinhood_testnet;
    const market = {
      address: dep,
      chainId,
      name: 'Morbit RWA',
      totalMarketSize,
      totalAvailableLiquidity,
      supplyReserves: uiReserves,
      borrowReserves: uiReserves.filter((r) => !!r.borrowInfo),
      eModeCategories: [],
      userState,
    };

    return { isErr: () => false, value: [market] };
  } catch (error) {
    return { isErr: () => true, error };
  }
};

function mockMarketsReserves() {
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

// ---- from @aave/types ----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PageSize = { Fifty: 50 };
export type Cursor = any;
export const useUserTransactionHistory = (..._args: any[]): any => ({
  data: null,
  isPending: false,
  pageInfo: { next: null },
});

// ---- Additional types used by various files ----
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DelegationType = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MetaDelegateParams = any;

// ---- Pool slice internal types (stubs) ----
export interface ApproveDelegationType {
  user: string;
  amount: string;
  [key: string]: any;
}

export class BaseDebtToken {
  [key: string]: any;
  constructor(..._args: any[]) {}
  // No debt tokens / credit delegation in the RWA market — report unlimited
  // delegation so the borrow flow never blocks on a delegation approval.
  async approvedDelegationAmount(..._args: any[]): Promise<any> {
    return '115792089237316195423570985008687907853269984665640564039457';
  }
  generateApproveDelegationTxData(..._args: any[]): any {
    throw new Error('Credit delegation is not supported in the Morbit RWA market');
  }
}
export class DebtSwitchAdapterService {
  [key: string]: any;
  constructor(..._args: any[]) {}
}
export class ERC20_2612Service {
  [key: string]: any;
  constructor(..._args: any[]) {}
}
export class EthereumTransactionTypeExtended {
  [key: string]: any;
  constructor(..._args: any[]) {}
  async tx(): Promise<any> {
    return {};
  }
}
export class FaucetParamsType {
  [key: string]: any;
  constructor(..._args: any[]) {}
}
export class FaucetService {
  [key: string]: any;
  constructor(..._args: any[]) {}
}
export class IncentivesController {
  [key: string]: any;
  constructor(..._args: any[]) {}
}
export class IncentivesControllerV2 {
  [key: string]: any;
  constructor(..._args: any[]) {}
}
export class IncentivesControllerV2Interface {
  [key: string]: any;
  constructor(..._args: any[]) {}
}
export class LendingPool {
  [key: string]: any;
  constructor(..._args: any[]) {}
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MAX_UINT_AMOUNT = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
export class PermitSignature {
  [key: string]: any;
  constructor(..._args: any[]) {}
}
// V3 Pool service used by poolSlice for withdraw / collateral toggling.
// Returns EthereumTransactionTypeExtended-shaped envelopes that
// useTransactionHandler consumes ({ txType, tx(), gas() }).
export class Pool {
  [key: string]: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(provider?: any, config?: { POOL?: string; [key: string]: any }) {
    this.provider = provider || getFallbackProvider();
    this.poolAddress = config?.POOL || getPoolAddress();
  }

  private dlpAction(user: string, data: string): any {
    return [
      {
        txType: 'DLP_ACTION',
        tx: async () => ({
          to: this.poolAddress,
          from: user,
          data,
          value: EthersBigNumber.from(0),
        }),
        gas: async () => ({ gasLimit: '600000' }),
      },
    ];
  }

  /** amount is human-readable; '-1' withdraws everything. */
  async withdraw({
    user,
    reserve,
    amount,
  }: {
    user: string;
    reserve: string;
    amount: string;
    [key: string]: any;
  }): Promise<any> {
    let amountWei;
    if (amount === '-1') {
      amountWei = constants.MaxUint256;
    } else {
      const decimals = await getErc20Contract(reserve, this.provider).decimals();
      amountWei = ethersUtils.parseUnits(amount, decimals);
    }
    const data = rwaPoolInterface.encodeFunctionData('withdraw', [reserve, amountWei, user]);
    return this.dlpAction(user, data);
  }

  async setUsageAsCollateral({
    user,
    reserve,
    usageAsCollateral,
  }: {
    user: string;
    reserve: string;
    usageAsCollateral: boolean;
    [key: string]: any;
  }): Promise<any> {
    const data = rwaPoolInterface.encodeFunctionData('setUserUseReserveAsCollateral', [
      reserve,
      usageAsCollateral,
    ]);
    return this.dlpAction(user, data);
  }

  async swapBorrowRateMode(..._args: any[]): Promise<any> {
    return [];
  }

  async paraswapRepayWithCollateral(..._args: any[]): Promise<any> {
    throw new Error('Repay with collateral is not supported in the Morbit RWA market');
  }
}
export class PoolBaseCurrencyHumanized {
  [key: string]: any;
  constructor(..._args: any[]) {}
}
export class ReserveDataHumanized {
  [key: string]: any;
  constructor(..._args: any[]) {}
}
export class ReservesIncentiveDataHumanized {
  [key: string]: any;
  constructor(..._args: any[]) {}
}
export class UserReserveDataHumanized {
  [key: string]: any;
  constructor(..._args: any[]) {}
}
export class V3FaucetService {
  [key: string]: any;
  constructor(..._args: any[]) {}
}
export class WithdrawAndSwitchAdapterService {
  [key: string]: any;
  constructor(..._args: any[]) {}
}
export class LPBorrowParamsType {
  [key: string]: any;
  constructor(..._args: any[]) {}
}
export class LPSetUsageAsCollateral {
  [key: string]: any;
  constructor(..._args: any[]) {}
}
export class LPSwapBorrowRateMode {
  [key: string]: any;
  constructor(..._args: any[]) {}
}
export class LPWithdrawParamsType {
  [key: string]: any;
  constructor(..._args: any[]) {}
}
export class LPRepayWithPermitParamsType {
  [key: string]: any;
  constructor(..._args: any[]) {}
}
export class LPSignERC20ApprovalType {
  [key: string]: any;
  constructor(..._args: any[]) {}
}
export class LPSupplyParamsType {
  [key: string]: any;
  constructor(..._args: any[]) {}
}
export class LPSupplyWithPermitType {
  [key: string]: any;
  constructor(..._args: any[]) {}
}

// Additional missing types used by poolSlice
export type SwapTransactionParams = any;
export type SignatureLike = any;
export type ClaimRewardsActionsProps = any;
export type SwapActionProps = any;
export const RewardSymbol = {
  ALL: 'all',
  PROTOCOL_ALL: 'protocol_all',
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type APYSample = any;
