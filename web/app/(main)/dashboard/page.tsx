'use client';

import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import StyledToggleButton from 'components/StyledToggleButton';
import StyledToggleButtonGroup from 'components/StyledToggleButtonGroup';
import { useRootStore } from 'store/root';
import { useShallow } from 'zustand/shallow';

import { ConnectWalletPaper } from '../../../components/ConnectWalletPaper';
import { ContentContainer } from '../../../components/ContentContainer';
import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { DashboardContentWrapper } from '../../../modules/dashboard/DashboardContentWrapper';
import { DashboardTopPanel } from '../../../modules/dashboard/DashboardTopPanel';

export default function Dashboard() {
  const { currentAccount } = useWeb3Context();
  const [trackEvent, currentMarket] = useRootStore(
    useShallow((store) => [store.trackEvent, store.currentMarket])
  );

  const [mode, setMode] = useState<'supply' | 'borrow' | ''>('supply');

  useEffect(() => {
    trackEvent('Page Viewed', {
      'Page Name': 'Dashboard',
      Market: currentMarket,
    });
  }, [trackEvent]);

  return (
    <>
      <DashboardTopPanel />

      <ContentContainer>
        {currentAccount && (
          <Box
            sx={{
              display: { xs: 'flex', lg: 'none' },
              justifyContent: { xs: 'center', xsm: 'flex-start' },
              mb: { xs: 3, xsm: 4 },
            }}
          >
            <StyledToggleButtonGroup
              color="primary"
              value={mode}
              exclusive
              onChange={(_, value) => setMode(value)}
              sx={{ width: { xs: '100%', xsm: '359px' }, height: '44px' }}
            >
              <StyledToggleButton value="supply" disabled={mode === 'supply'}>
                <Typography variant="subheader1">
                  <Trans>Supply</Trans>
                </Typography>
              </StyledToggleButton>
              <StyledToggleButton value="borrow" disabled={mode === 'borrow'}>
                <Typography variant="subheader1">
                  <Trans>Borrow</Trans>
                </Typography>
              </StyledToggleButton>
            </StyledToggleButtonGroup>
          </Box>
        )}

        {currentAccount ? (
          <DashboardContentWrapper isBorrow={mode === 'borrow'} />
        ) : (
          <ConnectWalletPaper />
        )}
      </ContentContainer>
    </>
  );
}
