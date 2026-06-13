import { ChainId } from './types';

export interface TokenConfig {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl: string;
  category: 'stock' | 'stablecoin' | 'rwa';
  priceUsd: number;
}

export interface DeploymentConfig {
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  pool: string;
  weth: string;
  tokens: Record<string, string>;
}

// ── Robinhood Chain tokens ───────────────────────────────────────────
const ROBINHOOD_TOKENS: Record<string, Omit<TokenConfig, 'address'>> = {
  USDG: { symbol: 'USDG', name: 'USDG', decimals: 6, logoUrl: '', category: 'stablecoin', priceUsd: 1 },
  TSLA: { symbol: 'TSLA', name: 'Tesla Inc.', decimals: 18, logoUrl: '', category: 'stock', priceUsd: 350 },
  AMZN: { symbol: 'AMZN', name: 'Amazon.com Inc.', decimals: 18, logoUrl: '', category: 'stock', priceUsd: 210 },
  PLTR: { symbol: 'PLTR', name: 'Palantir Technologies Inc.', decimals: 18, logoUrl: '', category: 'stock', priceUsd: 95 },
  NFLX: { symbol: 'NFLX', name: 'Netflix Inc.', decimals: 18, logoUrl: '', category: 'stock', priceUsd: 880 },
  AMD: { symbol: 'AMD', name: 'Advanced Micro Devices Inc.', decimals: 18, logoUrl: '', category: 'stock', priceUsd: 165 },
};

// ── Arbitrum Sepolia tokens (Ondo-style RWAs) ────────────────────────
const ARBITRUM_TOKENS: Record<string, Omit<TokenConfig, 'address'>> = {
  USDC: { symbol: 'USDC', name: 'USD Coin', decimals: 6, logoUrl: '', category: 'stablecoin', priceUsd: 1 },
  OUSG: { symbol: 'OUSG', name: 'Ondo Short-Term US Gov Bond', decimals: 18, logoUrl: '', category: 'rwa', priceUsd: 100 },
  USDY: { symbol: 'USDY', name: 'Ondo US Dollar Yield', decimals: 18, logoUrl: '', category: 'rwa', priceUsd: 1.05 },
};

// ── Chain → token meta map ──────────────────────────────────────────
const TOKEN_META_BY_CHAIN: Record<number, Record<string, Omit<TokenConfig, 'address'>>> = {
  [ChainId.robinhood_testnet]: ROBINHOOD_TOKENS,
  [ChainId.arbitrum_sepolia]: ARBITRUM_TOKENS,
};

// ── Current deployment state ────────────────────────────────────────
let currentDeployment: DeploymentConfig | null = null;

export function getDeployment(): DeploymentConfig | null {
  return currentDeployment;
}

export function setDeployment(config: DeploymentConfig | null) {
  currentDeployment = config;
}

export function getRwaTokens(): TokenConfig[] {
  const dep = currentDeployment;
  if (!dep) return [];

  const chainMeta = TOKEN_META_BY_CHAIN[dep.chainId];
  if (!chainMeta) return [];

  return Object.entries(chainMeta).map(([symbol, meta]) => ({
    ...meta,
    address: dep.tokens[symbol] || '0x0000000000000000000000000000000000000000',
  }));
}

export function getRwaTokenMap(): Record<string, TokenConfig> {
  const tokens = getRwaTokens();
  const map: Record<string, TokenConfig> = {};
  for (const t of tokens) {
    map[t.symbol] = t;
  }
  return map;
}
