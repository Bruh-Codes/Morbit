import { getRwaTokens, type TokenConfig } from './currentDeployment';

export type RwaToken = TokenConfig;

function lazyTokens(): Record<string, TokenConfig> {
  const tokens = getRwaTokens();
  const map: Record<string, TokenConfig> = {};
  for (const t of tokens) {
    map[t.symbol] = t;
  }
  return map;
}

export const rwaTokens = new Proxy({} as Record<string, TokenConfig>, {
  get(_target, prop: string) {
    return lazyTokens()[prop];
  },
  ownKeys() {
    return Reflect.ownKeys(lazyTokens());
  },
  getOwnPropertyDescriptor() {
    return { enumerable: true, configurable: true };
  },
});

export const ROBINHOOD_CHAIN_ID = 46630;

export const RWA_TOKEN_LIST: TokenConfig[] = new Proxy([] as TokenConfig[], {
  get(_target, prop: string | symbol) {
    if (prop === 'length' || prop === Symbol.iterator) {
      return getRwaTokens()[prop as any];
    }
    return getRwaTokens()[Number(prop)];
  },
});
