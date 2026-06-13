import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';

import { Warning } from '../../primitives/Warning';

export const AAVEWarning = () => {
  return (
    <Warning severity="info">
      <Typography>
        <Trans>Supplying your </Trans> AAVE{' '}
        <Trans>tokens is not the same as staking them.</Trans>
      </Typography>
    </Warning>
  );
};
