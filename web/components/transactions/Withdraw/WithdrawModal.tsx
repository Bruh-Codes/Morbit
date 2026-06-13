import { Trans } from '@lingui/macro';
import { useState } from 'react';
import { UserAuthenticated } from 'components/UserAuthenticated';
import { ModalContextType, ModalType, useModalContext } from 'hooks/useModal';
import { useRootStore } from 'store/root';
import { isFeatureEnabled } from 'utils/marketsAndNetworksConfig';

import { BasicModal } from '../../primitives/BasicModal';
import { ModalWrapper } from '../FlowCommons/ModalWrapper';
const WithdrawAndSwapModalContent = (_props: any) => null;
import { WithdrawModalContent } from './WithdrawModalContent';
import { WithdrawType, WithdrawTypeSelector } from './WithdrawTypeSelector';

export const WithdrawModal = () => {
  const { type, close, args, mainTxState } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;
  const [withdrawUnWrapped, setWithdrawUnWrapped] = useState(true);
  const [withdrawType, setWithdrawType] = useState(WithdrawType.WITHDRAW);
  const currentMarketData = useRootStore((store) => store.currentMarketData);

  const isWithdrawAndSwapPossible = isFeatureEnabled.withdrawAndSwitch(currentMarketData);

  const handleClose = () => {
    setWithdrawType(WithdrawType.WITHDRAW);
    close();
  };

  return (
    <BasicModal open={type === ModalType.Withdraw} setOpen={handleClose}>
      <ModalWrapper
        title={<Trans>Withdraw</Trans>}
        underlyingAsset={args.underlyingAsset}
        keepWrappedSymbol={!withdrawUnWrapped}
      >
        {(params) => (
          <UserAuthenticated>
            {(user) => (
              <>
                {isWithdrawAndSwapPossible && !mainTxState.txHash && (
                  <WithdrawTypeSelector
                    withdrawType={withdrawType}
                    setWithdrawType={setWithdrawType}
                  />
                )}
                {withdrawType === WithdrawType.WITHDRAW && (
                  <WithdrawModalContent
                    {...params}
                    unwrap={withdrawUnWrapped}
                    setUnwrap={setWithdrawUnWrapped}
                    user={user}
                  />
                )}
                {withdrawType === WithdrawType.WITHDRAW_AND_SWAP && (
                  <>
                    <WithdrawAndSwapModalContent underlyingAsset={args.underlyingAsset} />
                  </>
                )}
              </>
            )}
          </UserAuthenticated>
        )}
      </ModalWrapper>
    </BasicModal>
  );
};
