import { Emitter } from '@wagmi/core/internal';
import { getDefaultConfig } from 'connectkit';
import {
  ENABLE_TESTNET,
  FORK_BASE_CHAIN_ID,
  FORK_CHAIN_ID,
  FORK_ENABLED,
  FORK_RPC_URL,
  networkConfigs,
  STAGING_ENV,
} from 'utils/marketsAndNetworksConfig';
import { type Chain } from 'viem';
import { createConfig, CreateConfigParameters, http } from 'wagmi';
import { injected, safe } from 'wagmi/connectors';

import { prodNetworkConfig, testnetConfig } from './networksConfig';

const testnetChains = Object.values(testnetConfig).map((config) => config.wagmiChain) as [
  Chain,
  ...Chain[]
];

let prodChains = Object.values(prodNetworkConfig).map((config) => config.wagmiChain) as [
  Chain,
  ...Chain[]
];

const forkBaseConfig = networkConfigs[FORK_BASE_CHAIN_ID];
const name = forkBaseConfig?.name || 'Unknown';
const baseAssetDecimals = forkBaseConfig?.baseAssetDecimals || 18;
const baseAssetSymbol = forkBaseConfig?.baseAssetSymbol || 'ETH';

const forkChain: Chain = {
  id: FORK_CHAIN_ID,
  name: `${name} Fork`,
  nativeCurrency: {
    decimals: baseAssetDecimals,
    name: baseAssetSymbol,
    symbol: baseAssetSymbol,
  },
  rpcUrls: {
    default: { http: [FORK_RPC_URL] },
  },
  testnet: false,
};

if (FORK_ENABLED) {
  prodChains = [forkChain, ...prodChains];
}

const defaultConfig = {
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,
  appName: 'Morbit',
  appDescription: 'Non-custodial RWA lending protocol',
  appUrl: '',
  appIcon: '',
};

const cypressConfig = createConfig(
  getDefaultConfig({
    chains: [forkChain],
    connectors: [injected()],
    ...defaultConfig,
  })
);

const getTransport = (chainId: number) => {
  return networkConfigs[chainId]?.publicJsonRPCUrl[0];
};

const buildTransports = (chains: CreateConfigParameters['chains']) =>
  Object.fromEntries(chains.map((chain) => [chain.id, http(getTransport(chain.id))]));

// Show testnets (incl. Robinhood Chain Testnet) when staging or testnet toggle is on
const showTestnets = ENABLE_TESTNET || STAGING_ENV;

const prodCkConfig = getDefaultConfig({
  chains: showTestnets ? testnetChains : prodChains,
  transports: showTestnets ? undefined : buildTransports(prodChains),
  ...defaultConfig,
});

const morbitConnectorId = 'morbitAccountProvider';

const connectorConfig = {
  chains: prodCkConfig.chains,
  emitter: new Emitter(''),
};

const baseConnectors = prodCkConfig.connectors
  ?.map((connector) => {
    // initialize the connector with the emitter so we can access the id
    const c = connector(connectorConfig);
    if (c.id === 'safe') {
      return safe({
        allowedDomains: [/gnosis-safe.io$/, /app.safe.global$/, /dhedge.org$/],
      });
    } else {
      return connector;
    }
  })
  .sort((a, b) => {
    // sort connectors so the aave account connector is last
    // fixes slow wallet connections when running in the Safe UI
    if (a(connectorConfig).id === morbitConnectorId) {
      return 1;
    }
    if (b(connectorConfig).id === morbitConnectorId) {
      return -1;
    }
    return 0;
  });

const connectors = baseConnectors;

const prodConfig = createConfig({
  ...prodCkConfig,
  connectors,
});

const isCypressEnabled = process.env.NEXT_PUBLIC_IS_CYPRESS_ENABLED === 'true';

export const wagmiConfig = isCypressEnabled ? cypressConfig : prodConfig;
