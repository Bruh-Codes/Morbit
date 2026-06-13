import { StarIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Button, SvgIcon, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode } from 'react';

import { useRootStore } from '../../store/root';
import { NetworkConfig } from '../../ui-config/networksConfig';
import { MarketSwitcher } from '../MarketSwitcher';

export interface PageTitleProps extends Pick<NetworkConfig, 'bridge'> {
  pageTitle?: ReactNode;
  withMarketSwitcher?: boolean;
  withFavoriteButton?: boolean;
}

export const PageTitle = ({
  pageTitle,
  withMarketSwitcher,
  withFavoriteButton,
}: PageTitleProps) => {
  const currentMarket = useRootStore((state) => state.currentMarket);
  const isFavoriteMarket = useRootStore((state) => state.isFavoriteMarket);
  const toggleFavoriteMarket = useRootStore((state) => state.toggleFavoriteMarket);
  // Subscribe to favoriteMarkets to trigger re-renders when favorites change
  useRootStore((state) => state.favoriteMarkets);

  const theme = useTheme();
  const upToLG = useMediaQuery(theme.breakpoints.up('lg'));
  // const upToMD = useMediaQuery(theme.breakpoints.up('md'));
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  const isCurrentMarketFavorite = isFavoriteMarket(currentMarket);

  const handleFavoriteClick = () => {
    toggleFavoriteMarket(currentMarket);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: { xs: 'flex-start', xsm: 'center' },
        mb: pageTitle ? 4 : 0,
        flexDirection: { xs: 'column', xsm: 'row' },
      }}
    >
      {pageTitle && (downToXSM || !withMarketSwitcher) && (
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Typography
            variant={downToXSM ? 'h2' : upToLG ? 'display1' : 'h1'}
            sx={{
              color: withMarketSwitcher ? 'text.muted' : 'text.white',
              mr: { xs: 5, xsm: 3 },
              mb: { xs: 1, xsm: 0 },
            }}
          >
            {pageTitle}
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          mb: !pageTitle ? 4 : 0,
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {withMarketSwitcher && <MarketSwitcher />}
        </Box>

        {withFavoriteButton && (
          <Button
            onClick={handleFavoriteClick}
            variant="surface"
            sx={{
              display: 'none',
              [theme.breakpoints.up(800)]: { display: 'flex' }, // Hide on mobile (xs) and for widths between 759px and 800px, show on small screens and up
              p: '7px 8px',
              minWidth: 'unset',
              gap: 2,
              alignItems: 'center',
            }}
            aria-label="Favorite tool"
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SvgIcon
                sx={{
                  fontSize: '18px !important',
                  color: isCurrentMarketFavorite ? '#FBCC5F' : 'rgba(255, 255, 255, 0.3)',
                }}
              >
                <StarIcon />
              </SvgIcon>
            </Box>

            <Typography component="span" typography="subheader1" sx={{ fontWeight: 500 }}>
              {isCurrentMarketFavorite ? <Trans>Favourited</Trans> : <Trans>Favourite</Trans>}
            </Typography>
          </Button>
        )}
      </Box>
    </Box>
  );
};
