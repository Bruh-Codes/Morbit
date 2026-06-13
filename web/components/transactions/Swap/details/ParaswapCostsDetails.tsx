import { valueToBigNumber } from '@aave/math-utils';
import { Box } from '@mui/material';
import { ExecutionFeeTooltip } from 'components/infoTooltips/ExecutionFeeTooltip';
import { FormattedNumber } from 'components/primitives/FormattedNumber';
import { Row } from 'components/primitives/Row';
import { ExternalTokenIcon } from 'components/primitives/TokenIcon';

import { calculateParaswapFlashLoanFee } from '../helpers/paraswap/flashloan.helpers';
import { isParaswapRates, SwapState } from '../types';

export const ParaswapCostsDetails = ({ state }: { state: SwapState }) => {
  if (!state.swapRate || !isParaswapRates(state.swapRate)) return null;

  const { flashLoanFeeFormatted } = calculateParaswapFlashLoanFee(state);

  const flashLoanFeeUsd =
    state.sellAmountUSD && state.sellAmountFormatted && Number(flashLoanFeeFormatted) > 0
      ? valueToBigNumber(state.sellAmountUSD)
          .dividedBy(valueToBigNumber(state.sellAmountFormatted))
          .multipliedBy(valueToBigNumber(flashLoanFeeFormatted))
          .toNumber()
      : 0;

  const flashloanFeeToken = state.sellAmountToken;

  if (!flashLoanFeeFormatted || Number(flashLoanFeeFormatted) === 0 || !flashloanFeeToken) {
    return null;
  }

  return (
    <Row caption={<ExecutionFeeTooltip />} captionVariant="description" align="flex-start" mb={4}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ExternalTokenIcon
            symbol={flashloanFeeToken.symbol}
            logoURI={flashloanFeeToken.logoURI}
            height="16px"
            width="16px"
            sx={{ mr: 2, ml: 4, fontSize: '16px' }}
          />
          <FormattedNumber value={flashLoanFeeFormatted} variant="secondary12" compact />
        </Box>
        <FormattedNumber
          value={flashLoanFeeUsd}
          variant="helperText"
          compact
          symbol="USD"
          symbolsColor="text.secondary"
          color="text.secondary"
        />
      </Box>
    </Row>
  );
};
