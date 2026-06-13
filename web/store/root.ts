import { enableMapSet } from 'immer';
import { CustomMarket } from 'ui-config/marketsConfig';
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

import { AnalyticsSlice, createAnalyticsSlice } from './analyticsSlice';
import { createFavoriteMarketsSlice, FavoriteMarketsSlice } from './favoriteMarketsSlice';
import { createLayoutSlice, LayoutSlice } from './layoutSlice';
import { createPoolSlice, PoolSlice } from './poolSlice';
import { createProtocolDataSlice, ProtocolDataSlice } from './protocolDataSlice';
import { createTransactionsSlice, TransactionsSlice } from './transactionsSlice';
import { getQueryParameter } from './utils/queryParams';
import { createWalletSlice, WalletSlice } from './walletSlice';

enableMapSet();

export type RootStore = ProtocolDataSlice &
  WalletSlice &
  PoolSlice &
  AnalyticsSlice &
  TransactionsSlice &
  LayoutSlice &
  FavoriteMarketsSlice;

export const useRootStore = create<RootStore>()(
  subscribeWithSelector(
    devtools((...args) => {
      return {
        ...createProtocolDataSlice(...args),
        ...createWalletSlice(...args),
        ...createPoolSlice(...args),
        ...createAnalyticsSlice(...args),
        ...createTransactionsSlice(...args),
        ...createLayoutSlice(...args),
        ...createFavoriteMarketsSlice(...args),
      };
    })
  )
);

// hydrate state from localeStorage to not break on ssr issues
if (typeof document !== 'undefined') {
  document.onreadystatechange = function () {
    if (document.readyState == 'complete') {
      const selectedMarket =
        getQueryParameter('marketName') || localStorage.getItem('selectedMarket');

      if (selectedMarket) {
        const currentMarket = useRootStore.getState().currentMarket;
        const setCurrentMarket = useRootStore.getState().setCurrentMarket;
        if (selectedMarket !== currentMarket) {
          setCurrentMarket(selectedMarket as CustomMarket, true);
        }
      }

      // Hydrate favorite markets from localStorage
      useRootStore.getState().hydrateFavoriteMarkets();

      // Hydrate shield preference from localStorage
      useRootStore.getState().hydrateShield();
    }
  };
}
