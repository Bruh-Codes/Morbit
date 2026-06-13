import React, { PropsWithChildren, useContext, useEffect, useState } from 'react';
import { useWeb3Context } from 'libs/hooks/useWeb3Context';
import { useRootStore } from 'store/root';
import { getProvider, isFeatureEnabled } from 'utils/marketsAndNetworksConfig';
import { useShallow } from 'zustand/shallow';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PERMISSION = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PermissionManager = class {
  constructor(_config: any) {}
} as any;

type PermissionsContext = {
  permissions: PERMISSION[];
  isPermissionsLoading: boolean;
};

const Context = React.createContext<PermissionsContext>({
  permissions: [],
  isPermissionsLoading: false,
});

export const PermissionProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [chainId, currentMarketData] = useRootStore(
    useShallow((state) => [state.currentChainId, state.currentMarketData])
  );
  const { currentAccount: walletAddress } = useWeb3Context();
  const [isPermissionsLoading, setIsPermissionsLoading] = useState<boolean>(true);
  const [permissions, setPermissions] = useState<PERMISSION[]>([]);

  async function getPermissionData(permissionManagerAddress: string) {
    try {
      const instance = new PermissionManager({
        provider: getProvider(chainId),
        permissionManagerAddress: permissionManagerAddress,
      });
      const permissions = await instance.getHumanizedUserPermissions(walletAddress);
      setIsPermissionsLoading(true);
      setPermissions(permissions);
    } catch (e) {
      throw new Error('there was an error fetching your permissions');
    }
    setIsPermissionsLoading(false);
  }

  useEffect(() => {
    if (
      isFeatureEnabled.permissions(currentMarketData) &&
      walletAddress &&
      currentMarketData.addresses.PERMISSION_MANAGER
    ) {
      getPermissionData(currentMarketData.addresses.PERMISSION_MANAGER);
    } else {
      setIsPermissionsLoading(false);
    }
  }, [walletAddress, currentMarketData.addresses.PERMISSION_MANAGER]);

  return (
    <Context.Provider
      value={{
        permissions,
        isPermissionsLoading,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const usePermissions = () => useContext(Context);
