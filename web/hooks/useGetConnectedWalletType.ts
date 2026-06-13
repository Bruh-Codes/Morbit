import { useEffect, useState } from 'react';
import {
  isSafeWallet as getIsSafeWallet,
  isSmartContractWallet as getIsSmartContractWallet,
} from 'helpers/provider';
import { useWeb3Context } from 'libs/hooks/useWeb3Context';
import { getEthersProvider } from 'libs/web3-data-provider/adapters/EthersAdapter';
import { useRootStore } from 'store/root';
import { wagmiConfig } from 'ui-config/wagmiConfig';

export const useGetConnectedWalletType = () => {
  const { chainId } = useWeb3Context();
  const user = useRootStore((store) => store.account);
  const [isSmartContractWallet, setUserIsSmartContractWallet] = useState(false);
  const [isSafeWallet, setUserIsSafeWallet] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    getEthersProvider(wagmiConfig, { chainId })
      .then((provider) => {
        return Promise.all([
          getIsSmartContractWallet(user, provider),
          getIsSafeWallet(user, provider),
        ]);
      })
      .then(([isSmartContract, isSafe]) => {
        setUserIsSmartContractWallet(isSmartContract);
        setUserIsSafeWallet(isSafe);
      })
      .catch((error) => {
        console.error('Error fetching wallet type:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [chainId, user]);

  return { isSmartContractWallet, isSafeWallet, isLoading };
};
