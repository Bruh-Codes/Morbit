import { Dispatch, useEffect } from 'react';
import { isSafeWallet, isSmartContractWallet } from 'helpers/provider';
import { useWeb3Context } from 'libs/hooks/useWeb3Context';
import { getEthersProvider } from 'libs/web3-data-provider/adapters/EthersAdapter';
import { useRootStore } from 'store/root';
import { wagmiConfig } from 'ui-config/wagmiConfig';

import { SwapState } from '../types';

export const useUserContext = ({ setState }: { setState: Dispatch<Partial<SwapState>> }) => {
  const user = useRootStore((store) => store.account);
  const { chainId: connectedChainId } = useWeb3Context();

  useEffect(() => {
    try {
      if (user && connectedChainId) {
        setState({ user });
        getEthersProvider(wagmiConfig, { chainId: connectedChainId }).then((provider) => {
          Promise.all([isSmartContractWallet(user, provider), isSafeWallet(user, provider)]).then(
            ([isSmartContract, isSafe]) => {
              setState({ userIsSmartContractWallet: isSmartContract });
              setState({ userIsSafeWallet: isSafe });
            }
          );
        });
      }
    } catch (error) {
      console.error(error);
    }
  }, [user, connectedChainId]);
};
