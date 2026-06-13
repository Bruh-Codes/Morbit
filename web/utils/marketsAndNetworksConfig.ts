import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { ProviderWithSend } from 'components/transactions/GovVote/temporary/VotingMachineService';
import { ChainId, ChainIdToNetwork } from 'protocol/aave-compat';

import {
  CustomMarket,
  MarketDataType,
  marketsData as _marketsData,
} from '../ui-config/marketsConfig';
import {
  BaseNetworkConfig,
  ExplorerLinkBuilderConfig,
  ExplorerLinkBuilderProps,
  NetworkConfig,
  networkConfigs as _networkConfigs,
} from '../ui-config/networksConfig';
import { RotationProvider } from './rotationProvider';
import { ServerJsonRpcProvider } from './ServerJsonRpcProvider';

export type Pool = {
  address: string;
};

export const STAGING_ENV = process.env.NEXT_PUBLIC_ENV === 'staging';
export const PROD_ENV = !process.env.NEXT_PUBLIC_ENV || process.env.NEXT_PUBLIC_ENV === 'prod';
export const ENABLE_TESTNET = true;

// determines if forks should be shown
export const FORK_ENABLED =
  !!process.env.NEXT_PUBLIC_FORK_URL_RPC ||
  global?.window?.localStorage.getItem('forkEnabled') === 'true';
// specifies which network was forked
export const FORK_BASE_CHAIN_ID =
  Number(process.env.NEXT_PUBLIC_FORK_BASE_CHAIN_ID) ||
  Number(global?.window?.localStorage.getItem('forkBaseChainId') || 1);
// specifies on which chainId the fork is running
export const FORK_CHAIN_ID =
  Number(process.env.NEXT_PUBLIC_FORK_CHAIN_ID) ||
  Number(global?.window?.localStorage.getItem('forkNetworkId') || 3030);
export const FORK_RPC_URL =
  process.env.NEXT_PUBLIC_FORK_URL_RPC ||
  global?.window?.localStorage.getItem('forkRPCUrl') ||
  'http://127.0.0.1:8545';

/**
 * Generates network configs based on networkConfigs & fork settings.
 * Forks will have a rpcOnly clone of their underlying base network config.
 */
export const networkConfigs = Object.keys(_networkConfigs).reduce((acc, value) => {
  acc[value] = _networkConfigs[value];
  if (FORK_ENABLED && Number(value) === FORK_BASE_CHAIN_ID) {
    acc[FORK_CHAIN_ID] = {
      ..._networkConfigs[value],
      name: `${_networkConfigs[value].name} Fork`,
      isFork: true,
      publicJsonRPCUrl: [FORK_RPC_URL],
      underlyingChainId: FORK_BASE_CHAIN_ID,
    };
  }
  return acc;
}, {} as { [key: string]: BaseNetworkConfig });

/**
 * Generates network configs based on marketsData & fork settings.
 * Fork markets are generated for all markets on the underlying base chain.
 */

export const marketsData = Object.keys(_marketsData).reduce((acc, value) => {
  acc[value] = _marketsData[value as keyof typeof CustomMarket];
  if (
    FORK_ENABLED &&
    _marketsData[value as keyof typeof CustomMarket].chainId === FORK_BASE_CHAIN_ID
  ) {
    acc[`fork_${value}`] = {
      ..._marketsData[value as keyof typeof CustomMarket],
      chainId: FORK_CHAIN_ID,
      isFork: true,
    };
  }
  return acc;
}, {} as { [key: string]: MarketDataType });

export function getDefaultChainId() {
  return marketsData[availableMarkets[0]].chainId;
}

export function getSupportedChainIds(): number[] {
  return Array.from(
    Object.keys(marketsData)
      .filter((value) => {
        const isTestnet =
          networkConfigs[marketsData[value as keyof typeof CustomMarket].chainId].isTestnet;

        // If this is a staging environment, or the testnet toggle is on, only show testnets
        if (STAGING_ENV || ENABLE_TESTNET) {
          return isTestnet;
        }

        return !isTestnet;
      })
      .reduce(
        (acc, value) => acc.add(marketsData[value as keyof typeof CustomMarket].chainId),
        new Set<number>()
      )
  );
}

/**
 * selectable markets (markets in a available network + forks when enabled)
 */

export const availableMarkets = Object.keys(marketsData).filter(
  (key) =>
    key === CustomMarket.proto_robinhood_rwa || key === CustomMarket.proto_arbitrum_sepolia
) as CustomMarket[];

const linkBuilder =
  ({ baseUrl, addressPrefix = 'address', txPrefix = 'tx' }: ExplorerLinkBuilderConfig) =>
  ({ tx, address }: ExplorerLinkBuilderProps): string => {
    if (tx) {
      return `${baseUrl}/${txPrefix}/${tx}`;
    }
    if (address) {
      return `${baseUrl}/${addressPrefix}/${address}`;
    }
    return baseUrl;
  };

export function getNetworkConfig(chainId: ChainId): NetworkConfig {
  const config = networkConfigs[chainId];
  if (!config) {
    // this case can only ever occure when a wallet is connected with a unknown chainId which will not allow interaction
    const name = ChainIdToNetwork[chainId];
    return {
      name: name || `unknown chainId: ${chainId}`,
      publicJsonRPCUrl: [],
      explorerLink: '',
      explorerLinkBuilder: () => '',
      baseAssetSymbol: 'ETH',
      wrappedBaseAssetSymbol: 'WETH',
      baseAssetDecimals: 18,
      isTestnet: false,
    } as unknown as NetworkConfig;
  }
  return {
    ...config,
    explorerLinkBuilder: linkBuilder({ baseUrl: config.explorerLink }),
  };
}

export const isFeatureEnabled = {
  faucet: (data: MarketDataType) => data.enabledFeatures?.faucet,
  governance: (data: MarketDataType) => data.enabledFeatures?.governance,
  staking: (data: MarketDataType) => data.enabledFeatures?.staking,
  liquiditySwap: (data: MarketDataType) => data.enabledFeatures?.liquiditySwap,
  collateralRepay: (data: MarketDataType) => data.enabledFeatures?.collateralRepay,
  permissions: (data: MarketDataType) => data.enabledFeatures?.permissions,
  debtSwitch: (data: MarketDataType) => data.enabledFeatures?.debtSwitch,
  withdrawAndSwitch: (data: MarketDataType) => data.enabledFeatures?.withdrawAndSwitch,
  switch: (data: MarketDataType) => data.enabledFeatures?.switch,
};

const providers: { [network: string]: ProviderWithSend } = {};

/**
 * Created a fallback rpc provider in which providers are prioritized from private to public and in case there are multiple public ones, from top to bottom.
 * @param chainId
 * @returns provider or fallbackprovider in case multiple rpcs are configured
 */
export const getProvider = (chainId: ChainId): ProviderWithSend => {
  if (!providers[chainId]) {
    const config = getNetworkConfig(chainId);
    if (
      (FORK_ENABLED && FORK_BASE_CHAIN_ID === chainId) ||
      process.env.NEXT_PUBLIC_PRIVATE_RPC_ENABLED !== 'true'
    ) {
      // No private RPC or there is a fork configured, use public ones directly
      const chainProviders: string[] = [];

      if (config.publicJsonRPCUrl.length) {
        config.publicJsonRPCUrl.map((rpc) => chainProviders.push(rpc));
      }
      if (!chainProviders.length) {
        throw new Error(`${chainId} has no jsonRPCUrl configured`);
      }
      if (chainProviders.length === 1) {
        providers[chainId] = new StaticJsonRpcProvider(chainProviders[0], chainId);
      } else {
        providers[chainId] = new RotationProvider(chainProviders, chainId) as any;
      }
    } else {
      providers[chainId] = new ServerJsonRpcProvider(chainId);
    }
  }
  return providers[chainId];
};

export const getENSProvider = (): StaticJsonRpcProvider | undefined => {
  // ENS resolution not available — mainnet not configured
  return undefined;
};

export const frozenProposalMap: Record<string, string> = {};

// reexport so we can forbit config import
export { CustomMarket };
export type { MarketDataType, NetworkConfig };
