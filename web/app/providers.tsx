'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConnectKitProvider } from 'connectkit';
import { ReactNode, useState } from 'react';
import { WagmiProvider } from 'wagmi';

import { AppGlobalStyles } from '../layouts/AppGlobalStyles';
import { LanguageProvider } from '../libs/LanguageProvider';
import { Web3ContextProvider } from '../libs/web3-data-provider/Web3Provider';
import { SharedDependenciesProvider } from '../ui-config/SharedDependenciesProvider';
import { wagmiConfig } from '../ui-config/wagmiConfig';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const cleanLocalStorage = () => {
    localStorage.removeItem('readOnlyModeAddress');
  };

  return (
    <LanguageProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <ConnectKitProvider onDisconnect={cleanLocalStorage}>
            <AppGlobalStyles>
              <Web3ContextProvider>
                <SharedDependenciesProvider>{children}</SharedDependenciesProvider>
              </Web3ContextProvider>
            </AppGlobalStyles>
            {process.env.NODE_ENV !== 'production' && <ReactQueryDevtools initialIsOpen={false} />}
          </ConnectKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </LanguageProvider>
  );
}
