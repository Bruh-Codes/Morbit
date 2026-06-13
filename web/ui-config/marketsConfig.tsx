import { ReactNode } from 'react';
import { ChainId } from 'protocol/aave-compat';

import robinhoodDeployment from './robinhoodDeployment.json';
import arbitrumDeployment from './arbitrumDeployment.json';

const RWA_POOL_ADDRESS = robinhoodDeployment.pool;
const ARBITRUM_POOL_ADDRESS = arbitrumDeployment.pool;

export type MarketDataType = {
  v3?: boolean;
  marketTitle: string;
  market: CustomMarket;
  chainId: ChainId;
  enabledFeatures?: {
    liquiditySwap?: boolean;
    staking?: boolean;
    governance?: boolean;
    faucet?: boolean;
    collateralRepay?: boolean;
    incentives?: boolean;
    permissions?: boolean;
    debtSwitch?: boolean;
    withdrawAndSwitch?: boolean;
    switch?: boolean;
    limit?: boolean;
  };
  permitDisabled?: boolean;
  isFork?: boolean;
  permissionComponent?: ReactNode;
  subgraphUrl?: string;
  logo?: string;
  externalUrl?: string;
  addresses: {
    LENDING_POOL_ADDRESS_PROVIDER: string;
    LENDING_POOL: string;
    WETH_GATEWAY?: string;
    SWAP_COLLATERAL_ADAPTER?: string;
    REPAY_WITH_COLLATERAL_ADAPTER?: string;
    DEBT_SWITCH_ADAPTER?: string;
    WITHDRAW_SWITCH_ADAPTER?: string;
    FAUCET?: string;
    PERMISSION_MANAGER?: string;
    WALLET_BALANCE_PROVIDER: string;
    L2_ENCODER?: string;
    UI_POOL_DATA_PROVIDER: string;
    UI_INCENTIVE_DATA_PROVIDER?: string;
    COLLECTOR?: string;
    V3_MIGRATOR?: string;
    GHO_TOKEN_ADDRESS?: string;
  };
};

export enum CustomMarket {
  proto_robinhood_rwa = 'proto_robinhood_rwa',
  proto_arbitrum_sepolia = 'proto_arbitrum_sepolia',
}

export const marketsData: {
  [_key in keyof typeof CustomMarket]: MarketDataType;
} = {
  [CustomMarket.proto_robinhood_rwa]: {
    marketTitle: 'Robinhood',
    market: CustomMarket.proto_robinhood_rwa,
    chainId: ChainId.robinhood_testnet,
    v3: true,
    logo: '/icons/markets/robinhood.png',
    permitDisabled: true,
    enabledFeatures: {},
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: RWA_POOL_ADDRESS,
      LENDING_POOL: RWA_POOL_ADDRESS,
      WALLET_BALANCE_PROVIDER: RWA_POOL_ADDRESS,
      UI_POOL_DATA_PROVIDER: RWA_POOL_ADDRESS,
      UI_INCENTIVE_DATA_PROVIDER: '0x0000000000000000000000000000000000000000',
    },
  },
  [CustomMarket.proto_arbitrum_sepolia]: {
    marketTitle: 'Arbitrum RWA',
    market: CustomMarket.proto_arbitrum_sepolia,
    chainId: ChainId.arbitrum_sepolia,
    v3: true,
    logo: '/icons/networks/arbitrum.svg',
    permitDisabled: true,
    enabledFeatures: {},
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: ARBITRUM_POOL_ADDRESS,
      LENDING_POOL: ARBITRUM_POOL_ADDRESS,
      WALLET_BALANCE_PROVIDER: ARBITRUM_POOL_ADDRESS,
      UI_POOL_DATA_PROVIDER: ARBITRUM_POOL_ADDRESS,
      UI_INCENTIVE_DATA_PROVIDER: '0x0000000000000000000000000000000000000000',
    },
  },
};
