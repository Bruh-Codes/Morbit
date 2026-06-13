import { Trans } from '@lingui/macro';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { TypographyProps } from '@mui/material/Typography';
import { BigNumber } from 'bignumber.js';
import { valueToBigNumber } from 'protocol/aave-compat';

import { FormattedNumber } from './primitives/FormattedNumber';
import { TextWithTooltip } from './TextWithTooltip';

interface HealthFactorNumberProps extends TypographyProps {
  value: string;
  onInfoClick?: () => void;
}

export const HealthFactorNumber = ({ value, onInfoClick, ...rest }: HealthFactorNumberProps) => {
  const { palette } = useTheme();

  const formattedHealthFactor = Number(valueToBigNumber(value).toFixed(2, BigNumber.ROUND_DOWN));
  let healthFactorColor = '';
  if (formattedHealthFactor >= 3) {
    healthFactorColor = palette.success.main;
  } else if (formattedHealthFactor < 1.1) {
    healthFactorColor = palette.error.main;
  } else {
    healthFactorColor = palette.warning.main;
  }

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: { xs: 'flex-start', xsm: 'center' },
        flexDirection: { xs: 'column', xsm: 'row' },
      }}
      data-cy={'HealthFactorTopPannel'}
    >
      {value === '-1' ? (
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <Typography variant="secondary14" color={palette.success.main}>
            ∞
          </Typography>
          <TextWithTooltip>
            <Trans>
              No debt means your position cannot be liquidated. The Health Factor is infinite.
            </Trans>
          </TextWithTooltip>
        </Box>
      ) : (
        <FormattedNumber
          value={formattedHealthFactor}
          sx={{ color: healthFactorColor, ...rest.sx }}
          visibleDecimals={2}
          compact
          {...rest}
        />
      )}

      {onInfoClick && (
        <Button
          onClick={onInfoClick}
          variant="surface"
          size="small"
          sx={{ minWidth: 'unset', ml: { xs: 0, xsm: 2 } }}
        >
          <Trans>Risk details</Trans>
        </Button>
      )}
    </Box>
  );
};
