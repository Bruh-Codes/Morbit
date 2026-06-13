// Robinhood Chain tokenized stock tokens (testnet)
// Addresses come from robinhoodDeployment.json (synced by `npx hardhat sync-deployment`).
// UI metadata (names, logos, categories) lives here.

import deployment from '../ui-config/robinhoodDeployment.json';

export interface RwaToken {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoUrl: string;
  category: 'stock' | 'stablecoin' | 'token';
  priceUsd: number;
}

export const ROBINHOOD_CHAIN_ID = deployment.chainId;

// UI metadata — addresses are read from deployment.tokens
const TOKEN_META: Record<string, Omit<RwaToken, 'address'>> = {
  USDG: { symbol: 'USDG', name: 'USDG', decimals: 6, logoUrl: '', category: 'stablecoin', priceUsd: 1 },
  TSLA: { symbol: 'TSLA', name: 'Tesla Inc.', decimals: 18, logoUrl: '', category: 'stock', priceUsd: 350 },
  AMZN: { symbol: 'AMZN', name: 'Amazon.com Inc.', decimals: 18, logoUrl: '', category: 'stock', priceUsd: 210 },
  PLTR: { symbol: 'PLTR', name: 'Palantir Technologies Inc.', decimals: 18, logoUrl: '', category: 'stock', priceUsd: 95 },
  NFLX: { symbol: 'NFLX', name: 'Netflix Inc.', decimals: 18, logoUrl: '', category: 'stock', priceUsd: 880 },
  AMD: { symbol: 'AMD', name: 'Advanced Micro Devices Inc.', decimals: 18, logoUrl: '', category: 'stock', priceUsd: 165 },
};

export const rwaTokens: Record<string, RwaToken> = Object.fromEntries(
  Object.entries(TOKEN_META).map(([symbol, meta]) => [
    symbol,
    { ...meta, address: (deployment.tokens as Record<string, string>)[symbol] || '0x0000000000000000000000000000000000000000' },
  ])
);

export const RWA_TOKEN_LIST = Object.values(rwaTokens);
