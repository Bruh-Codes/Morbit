'use client';

import { Box, Container } from '@mui/material';
import { ReactNode, useEffect } from 'react';
import { MarketAssetsListContainer } from 'modules/markets/MarketAssetsListContainer';
import { marketContainerProps } from 'modules/markets/marketContainerProps';
import { MarketsTopPanel } from 'modules/markets/MarketsTopPanel';
import { useRootStore } from 'store/root';

interface MarketContainerProps {
  children: ReactNode;
}

const MarketContainer = ({ children }: MarketContainerProps) => {
  return <Container {...marketContainerProps}>{children}</Container>;
};

export default function Markets() {
  const trackEvent = useRootStore((store) => store.trackEvent);

  useEffect(() => {
    trackEvent('Page Viewed', {
      'Page Name': 'Markets',
    });
  }, [trackEvent]);

  return (
    <>
      <MarketsTopPanel />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1,
          mt: { xs: '-32px', lg: '-46px', xl: '-44px', xxl: '-48px' },
        }}
      >
        <MarketContainer>
          <MarketAssetsListContainer />
        </MarketContainer>
      </Box>
    </>
  );
}
