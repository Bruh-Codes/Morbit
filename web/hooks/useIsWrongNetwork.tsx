import { useWeb3Context } from 'libs/hooks/useWeb3Context';
import { useRootStore } from 'store/root';

export function useIsWrongNetwork(_requiredChainId?: number) {
  const currentChainId = useRootStore((store) => store.currentChainId);
  const { chainId: connectedChainId } = useWeb3Context();

  const requiredChainId = _requiredChainId ? _requiredChainId : currentChainId;

  const isWrongNetwork = connectedChainId !== requiredChainId;

  return {
    isWrongNetwork,
    requiredChainId,
  };
}
