import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { ApprovedAmountService } from 'services/ApprovedAmountService';
import { DelegationTokenService } from 'services/DelegationTokenService';
import { ERC20Service } from 'services/Erc20Service';
import { TokenWrapperService } from 'services/TokenWrapperService';
import { UiIncentivesService } from 'services/UIIncentivesService';
import { UiPoolService } from 'services/UIPoolService';
import { WalletBalanceService } from 'services/WalletBalanceService';
import { getProvider } from 'utils/marketsAndNetworksConfig';
import invariant from 'tiny-invariant';

interface SharedDependenciesContext {
  poolTokensBalanceService: WalletBalanceService;
  approvedAmountService: ApprovedAmountService;
  delegationTokenService: DelegationTokenService;
  tokenWrapperService: TokenWrapperService;
  uiIncentivesService: UiIncentivesService;
  uiPoolService: UiPoolService;
  erc20Service: ERC20Service;
}

const SharedDependenciesContext = createContext<SharedDependenciesContext | null>(null);

export const SharedDependenciesProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const services = useMemo(
    () => ({
      poolTokensBalanceService: new WalletBalanceService(getProvider),
      approvedAmountService: new ApprovedAmountService(getProvider),
      delegationTokenService: new DelegationTokenService(getProvider),
      tokenWrapperService: new TokenWrapperService(getProvider),
      uiPoolService: new UiPoolService(getProvider),
      uiIncentivesService: new UiIncentivesService(getProvider),
      erc20Service: new ERC20Service(getProvider),
    }),
    []
  );

  return (
    <SharedDependenciesContext.Provider value={services}>
      {children}
    </SharedDependenciesContext.Provider>
  );
};

export const useSharedDependencies = () => {
  const context = useContext(SharedDependenciesContext);
  invariant(context, 'Component should be wrapper inside a <SharedDependenciesProvider />');
  return context;
};
