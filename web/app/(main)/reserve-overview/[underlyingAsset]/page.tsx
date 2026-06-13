'use client';

import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import StyledToggleButton from 'components/StyledToggleButton';
import StyledToggleButtonGroup from 'components/StyledToggleButtonGroup';
import {
  ComputedReserveData,
  ReserveWithId,
  useAppDataContext,
} from 'hooks/app-data-provider/useAppDataProvider';
import { AssetCapsProvider } from 'hooks/useAssetCaps';
import { AssetCapsProviderSDK } from 'hooks/useAssetCapsSDK';
import { ReserveActions } from 'modules/reserve-overview/ReserveActions';
import { ReserveConfigurationWrapper } from 'modules/reserve-overview/ReserveConfigurationWrapper';
import { ReserveTopDetailsWrapper } from 'modules/reserve-overview/ReserveTopDetailsWrapper';
import { useRootStore } from 'store/root';

import { ContentContainer } from '../../../../components/ContentContainer';

export default function ReserveOverview() {
  const params = useParams();
  const underlyingAsset = params.underlyingAsset as string;
  const { supplyReserves, reserves } = useAppDataContext();

  const [mode, setMode] = useState<'overview' | 'actions' | ''>('overview');
  const trackEvent = useRootStore((store) => store.trackEvent);

  const reserve = supplyReserves.find((reserve) => {
    return reserve.underlyingToken.address.toLowerCase() === underlyingAsset?.toLowerCase();
  }) as ReserveWithId;

  const reserveLegacy = reserves.find((reserve) => {
    return reserve.underlyingAsset.toLowerCase() === underlyingAsset?.toLowerCase();
  }) as ComputedReserveData;
  const [pageEventCalled, setPageEventCalled] = useState(false);

  useEffect(() => {
    if (!pageEventCalled && reserve && reserve.underlyingToken.symbol && underlyingAsset) {
      trackEvent('Page Viewed', {
        'Page Name': 'Reserve Overview',
        Reserve: reserve.underlyingToken.symbol,
        Asset: underlyingAsset,
      });
      setPageEventCalled(true);
    }
  }, [trackEvent, reserve, underlyingAsset, pageEventCalled]);

  const isOverview = mode === 'overview';

  return (
    <AssetCapsProviderSDK asset={reserve}>
      <ReserveTopDetailsWrapper underlyingAsset={underlyingAsset} />

      <ContentContainer>
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
            <StyledToggleButton value="overview" disabled={mode === 'overview'}>
              <Typography variant="subheader1">
                <Trans>Overview</Trans>
              </Typography>
            </StyledToggleButton>
            <StyledToggleButton value="actions" disabled={mode === 'actions'}>
              <Typography variant="subheader1">
                <Trans>Your info</Trans>
              </Typography>
            </StyledToggleButton>
          </StyledToggleButtonGroup>
        </Box>

        <Box sx={{ display: 'flex' }}>
          <Box
            sx={{
              display: { xs: !isOverview ? 'none' : 'block', lg: 'block' },
              width: { xs: '100%', lg: 'calc(100% - 432px)' },
              mr: { xs: 0, lg: 4 },
            }}
          >
            <ReserveConfigurationWrapper reserve={reserve} />
          </Box>

          <Box
            sx={{
              display: { xs: isOverview ? 'none' : 'block', lg: 'block' },
              width: { xs: '100%', lg: '416px' },
            }}
          >
            <AssetCapsProvider asset={reserveLegacy}>
              <ReserveActions reserve={reserveLegacy} />
            </AssetCapsProvider>
          </Box>
        </Box>
      </ContentContainer>
    </AssetCapsProviderSDK>
  );
}
