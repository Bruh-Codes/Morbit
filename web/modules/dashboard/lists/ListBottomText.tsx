import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';

export const ListBottomText = () => {
  return (
    <Typography variant="secondary14" color="text.secondary">
      <Trans>
        Since this is a test network, you can get any of the assets if you have ETH on your wallet.
      </Trans>
    </Typography>
  );
};
