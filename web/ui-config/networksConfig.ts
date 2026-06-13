import { ChainId } from 'protocol/aave-compat';
import { arbitrum, arbitrumSepolia, Chain } from 'wagmi/chains';
import robinhoodDeployment from './robinhoodDeployment.json';
import arbitrumSepoliaDeployment from './arbitrumDeployment.json';

export type ExplorerLinkBuilderProps = {
  tx?: string;
  address?: string;
};

export type ExplorerLinkBuilderConfig = {
  baseUrl: string;
  addressPrefix?: string;
  txPrefix?: string;
};

export type NetworkConfig = {
  name: string;
  displayName?: string;
  publicJsonRPCUrl: readonly string[];
  baseUniswapAdapter?: string;
  wrappedBaseAssetSymbol: string;
  baseAssetSymbol: string;
  baseAssetDecimals: number;
  explorerLink: string;
  explorerLinkBuilder: (props: ExplorerLinkBuilderProps) => string;
  isTestnet?: boolean;
  isFork?: boolean;
  networkLogoPath: string;
  underlyingChainId?: number;
  bridge?: {
    icon: string;
    name: string;
    url: string;
  };
  wagmiChain: Chain;
};

export type BaseNetworkConfig = Omit<NetworkConfig, 'explorerLinkBuilder'>;

const ROBINHOOD_RPC_URL = robinhoodDeployment.rpcUrl;
const ROBINHOOD_EXPLORER_URL = robinhoodDeployment.explorerUrl;

const ARBITRUM_SEPOLIA_RPC_URL = arbitrumSepoliaDeployment.rpcUrl || 'https://arbitrum-sepolia.publicnode.com';
const ARBITRUM_SEPOLIA_EXPLORER_URL = arbitrumSepoliaDeployment.explorerUrl || 'https://sepolia-explorer.arbitrum.io';

export const robinhoodTestnet: Chain = {
  id: ChainId.robinhood_testnet,
  name: 'Robinhood Chain Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [ROBINHOOD_RPC_URL] },
    public: { http: [ROBINHOOD_RPC_URL] },
  },
  blockExplorers: {
    default: { name: 'Robinhood Explorer', url: ROBINHOOD_EXPLORER_URL },
  },
  testnet: true,
};



export const testnetConfig: Record<string, BaseNetworkConfig> = {
  [ChainId.robinhood_testnet]: {
    name: 'Robinhood Chain Testnet',
    displayName: 'Robinhood Testnet',
    publicJsonRPCUrl: [ROBINHOOD_RPC_URL],
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: ROBINHOOD_EXPLORER_URL,
    isTestnet: true,
    networkLogoPath: '/icons/networks/robinhood.svg',
    wagmiChain: robinhoodTestnet,
  },
  [ChainId.arbitrum_sepolia]: {
    name: 'Arbitrum Sepolia',
    displayName: 'Arbitrum Sepolia',
    publicJsonRPCUrl: [ARBITRUM_SEPOLIA_RPC_URL],
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: ARBITRUM_SEPOLIA_EXPLORER_URL,
    isTestnet: true,
    networkLogoPath: '/icons/networks/arbitrum.svg',
    wagmiChain: arbitrumSepolia,
  },
};

export const prodNetworkConfig: Record<string, BaseNetworkConfig> = {
  [ChainId.arbitrum_one]: {
    name: 'Arbitrum',
    publicJsonRPCUrl: [
      'https://arb1.arbitrum.io/rpc',
      'https://rpc.ankr.com/arbitrum',
      'https://1rpc.io/arb',
    ],
    baseUniswapAdapter: '0x0',
    baseAssetSymbol: 'ETH',
    wrappedBaseAssetSymbol: 'WETH',
    baseAssetDecimals: 18,
    explorerLink: 'https://arbiscan.io',
    networkLogoPath: '/icons/networks/arbitrum.svg',
    wagmiChain: arbitrum,
  },
};

export const networkConfigs = {
  ...testnetConfig,
  ...prodNetworkConfig,
};
