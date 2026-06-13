import { APPROVAL_GAS_LIMIT } from 'components/transactions/utils';
import { TxStateType } from 'hooks/useModal';

import { COW_PROTOCOL_GAS_LIMITS } from '../constants/cow.constants';
import { PARASWAP_GAS_LIMITS } from '../constants/paraswap.constants';
import { SwapProvider, SwapType, TokenType } from '../types';

const isNativeToken = (address: string): boolean => {
  return (
    address === '0x0000000000000000000000000000000000000000' ||
    address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
  );
};

export interface GasEstimationParams {
  swapType: SwapType;
  provider: SwapProvider;
  sourceToken: { addressToSwap: string; tokenType: TokenType };
  userIsSmartContractWallet: boolean;
  requiresApproval: boolean;
  requiresApprovalReset: boolean;
  approvalTxState: TxStateType;
  useFlashloan: boolean;
  usePermit: boolean;
}

export interface GasEstimationResult {
  gasLimit: string;
  showGasStation: boolean;
  breakdown: {
    baseGas: number;
    approvalGas: number;
    resetApprovalGas: number;
    total: number;
  };
}

export const estimateSwapGas = (params: GasEstimationParams): GasEstimationResult => {
  const {
    swapType,
    provider,
    sourceToken,
    userIsSmartContractWallet,
    requiresApproval,
    requiresApprovalReset,
    approvalTxState,
    useFlashloan,
    usePermit,
  } = params;

  let baseGas = 0;
  let approvalGas = 0;
  let resetApprovalGas = 0;
  let showGasStation = false;

  if (provider === SwapProvider.PARASWAP) {
    baseGas = PARASWAP_GAS_LIMITS[swapType] ?? 0;
    showGasStation = true;
  } else if (provider === SwapProvider.COW_PROTOCOL) {
    const isEthNativeSwap = isNativeToken(sourceToken.addressToSwap);
    if (
      (swapType === SwapType.Swap && (isEthNativeSwap || userIsSmartContractWallet)) ||
      (swapType === SwapType.CollateralSwap && !useFlashloan)
    ) {
      baseGas = COW_PROTOCOL_GAS_LIMITS[swapType] ?? 0;
      showGasStation = true;
    } else {
      baseGas = 0;
      showGasStation = false;
    }
  } else {
    baseGas = 0;
    showGasStation = false;
  }

  if (requiresApproval && !approvalTxState.success && !usePermit) {
    approvalGas = Number(APPROVAL_GAS_LIMIT);
    showGasStation = true;
  }

  if (requiresApprovalReset && !usePermit) {
    resetApprovalGas = Number(APPROVAL_GAS_LIMIT);
    showGasStation = true;
  }

  const total = baseGas + approvalGas + resetApprovalGas;

  return {
    gasLimit: total.toString(),
    showGasStation,
    breakdown: {
      baseGas,
      approvalGas,
      resetApprovalGas,
      total,
    },
  };
};

export const shouldShowGasStation = (
  provider: SwapProvider,
  sourceToken: { addressToSwap: string; tokenType: TokenType },
  userIsSmartContractWallet: boolean,
  requiresApproval: boolean
): boolean => {
  if (provider === SwapProvider.PARASWAP) {
    return true;
  }

  if (provider === SwapProvider.COW_PROTOCOL) {
    const isEthNativeSwap = isNativeToken(sourceToken.addressToSwap);
    return isEthNativeSwap || userIsSmartContractWallet || requiresApproval;
  }

  return requiresApproval;
};

export const getNativeTokenGasEstimation = (
  chainId: number,
  tokenType: TokenType
): { gasRequired: string; showWarning: boolean } => {
  const gasRequirements = {
    1: '0.01',
    137: '0.001',
    42161: '0.001',
    10: '0.001',
    56: '0.001',
    43114: '0.001',
  };

  const gasRequired = gasRequirements[chainId as keyof typeof gasRequirements] || '0.001';
  const showWarning = tokenType === TokenType.NATIVE;

  return { gasRequired, showWarning };
};
