import { RwaToken, rwaTokens } from './rwaTokens';
import { ReserveData } from './types';

// Simulated pool data for RWA tokens on Robinhood Chain
// Replace with real contract calls when a lending pool is deployed

function generateReserve(token: RwaToken, index: number): ReserveData {
  const totalLiquidity = token.category === 'stablecoin' ? 50000000 : 10000000;
  const totalBorrowed = token.category === 'stablecoin' ? 30000000 : 4000000;
  const supplyApy = token.category === 'stablecoin' ? 4.5 : 2.8;
  const borrowApy = token.category === 'stablecoin' ? 6.2 : 4.1;

  return {
    id: `0x${index.toString(16).padStart(40, '0')}`,
    underlyingToken: {
      address: token.address,
      symbol: token.symbol,
      name: token.name,
      decimals: token.decimals,
      logoUrl: token.logoUrl,
    },
    supplyInfo: {
      apy: { value: supplyApy },
      total: {
        value: totalLiquidity,
        usd: totalLiquidity * token.priceUsd,
      },
      supplyCap: { amount: { value: String(totalLiquidity * 2) } },
    },
    borrowInfo: {
      apy: { value: borrowApy },
      total: {
        value: totalBorrowed,
        usd: totalBorrowed * token.priceUsd,
      },
      borrowingState: 'ENABLED',
      borrowCap: { amount: { value: String(totalBorrowed * 2) } },
      utilizationRate: { value: (totalBorrowed / totalLiquidity) * 100 },
    },
    isFrozen: false,
    isPaused: false,
    eModeInfo: [],
    incentives: undefined,
    totalLiquidity: String(totalLiquidity),
    totalLiquidityUSD: String(totalLiquidity * token.priceUsd),
    availableLiquidity: String(totalLiquidity - totalBorrowed),
    availableLiquidityUSD: String((totalLiquidity - totalBorrowed) * token.priceUsd),
    totalDebt: String(totalBorrowed),
    totalDebtUSD: String(totalBorrowed * token.priceUsd),
    priceInUSD: token.priceUsd,
  };
}

export function getPoolReserves(): ReserveData[] {
  return Object.values(rwaTokens).map((token, i) => generateReserve(token, i));
}

export function getReserveById(id: string): ReserveData | undefined {
  return getPoolReserves().find((r) => r.id === id);
}

export function getReserveBySymbol(symbol: string): ReserveData | undefined {
  return getPoolReserves().find((r) => r.underlyingToken.symbol === symbol);
}
