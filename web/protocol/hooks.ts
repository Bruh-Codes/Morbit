import { useState } from 'react';

export function useTokenInForTokenOut(_amount: string, _decimals: number, _wrapperAddress: string) {
  const [data] = useState<string | undefined>(undefined);
  return { data };
}

export function useTokenOutForTokenIn(_amount: string, _decimals: number, _wrapperAddress: string) {
  const [data] = useState<string | undefined>(undefined);
  const [isFetching] = useState(false);
  return { isFetching, data };
}
