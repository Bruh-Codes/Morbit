import React, { ReactElement } from 'react';
import {
  ComputedReserveData,
  ComputedUserReserveData,
  useAppDataContext,
} from 'hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from 'hooks/app-data-provider/useWalletBalances';
import { AssetCapsProvider } from 'hooks/useAssetCaps';
import { useIsWrongNetwork } from 'hooks/useIsWrongNetwork';
import { useModalContext } from 'hooks/useModal';
import { useWeb3Context } from 'libs/hooks/useWeb3Context';
import { API_ETH_MOCK_ADDRESS } from 'protocol/aave-compat';
import { useRootStore } from 'store/root';
import { GENERAL } from 'utils/events';
import { getNetworkConfig } from 'utils/marketsAndNetworksConfig';

import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { TxErrorView } from './Error';

export interface ModalWrapperProps {
  underlyingAsset: string;
  poolReserve: ComputedReserveData;
  userReserve: ComputedUserReserveData;
  symbol: string;
  tokenBalance: string;
  nativeBalance: string;
  isWrongNetwork: boolean;
  action?: string;
}

export const ModalWrapper: React.FC<{
  underlyingAsset: string;
  title: ReactElement;
  requiredChainId?: number;
  // if true wETH will stay wETH otherwise wETH will be returned as ETH
  keepWrappedSymbol?: boolean;
  hideTitleSymbol?: boolean;
  children: (_props: ModalWrapperProps) => React.ReactNode;
  action?: string;
}> = ({
  hideTitleSymbol,
  underlyingAsset,
  children,
  requiredChainId: _requiredChainId,
  title,
  keepWrappedSymbol,
}) => {
  const { readOnlyModeAddress } = useWeb3Context();
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);
  const { walletBalances } = useWalletBalances(currentMarketData);
  const { user, reserves } = useAppDataContext();
  const { txError, mainTxState } = useModalContext();

  const { isWrongNetwork, requiredChainId } = useIsWrongNetwork(_requiredChainId);

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }

  const poolReserve = reserves.find((reserve) => {
    if (underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase())
      return reserve.isWrappedBaseAsset;
    return underlyingAsset === reserve.underlyingAsset;
  }) as ComputedReserveData;

  const userReserve = user?.userReservesData.find(
    (userReserve: { reserve: { isWrappedBaseAsset: boolean }; underlyingAsset: string }) => {
      if (underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase())
        return userReserve.reserve.isWrappedBaseAsset;
      return underlyingAsset === userReserve.underlyingAsset;
    }
  ) as ComputedUserReserveData;

  const symbol =
    poolReserve.isWrappedBaseAsset && !keepWrappedSymbol
      ? currentNetworkConfig.baseAssetSymbol
      : poolReserve.symbol;

  return (
    <AssetCapsProvider asset={poolReserve}>
      {!mainTxState.success && (
        <TxModalTitle title={title} symbol={hideTitleSymbol ? undefined : symbol} />
      )}
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning
          autoSwitchOnMount={true}
          networkName={getNetworkConfig(requiredChainId).name}
          chainId={requiredChainId}
          event={{
            eventName: GENERAL.SWITCH_NETWORK,
            eventParams: {
              asset: underlyingAsset,
            },
          }}
        />
      )}
      {children({
        isWrongNetwork,
        nativeBalance: walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amount || '0',
        tokenBalance: walletBalances[poolReserve.underlyingAsset.toLowerCase()]?.amount || '0',
        poolReserve,
        symbol,
        underlyingAsset,
        userReserve,
      })}
    </AssetCapsProvider>
  );
};
