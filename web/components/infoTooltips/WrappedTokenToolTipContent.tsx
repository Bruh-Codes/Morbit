import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const WrappedTokenTooltipContent = (_props: any) => {
  return (
    <Typography variant="tooltip">
      <Trans>Wrapped token conversion info.</Trans>
    </Typography>
  );
};
