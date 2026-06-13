import { Trans } from '@lingui/macro';
import { Box, BoxProps, ButtonBase, Paper, PaperProps, Typography } from '@mui/material';
import { ReactNode, useState } from 'react';
import { useRootStore } from 'store/root';
import { DASHBOARD } from 'utils/events';

import { toggleLocalStorageClick } from '../../helpers/toggle-local-storage-click';

interface ListWrapperProps {
  titleComponent: ReactNode;
  localStorageName?: string;
  subTitleComponent?: ReactNode;
  subChildrenComponent?: ReactNode;
  topInfo?: ReactNode;
  children: ReactNode;
  withTopMargin?: boolean;
  noData?: boolean;
  wrapperSx?: BoxProps['sx'];
  tooltipOpen?: boolean;
  paperSx?: PaperProps['sx'];
  topInfoSx?: BoxProps['sx'];
  onCollapseChange?: (collapsed: boolean) => void;
}

export const ListWrapper = ({
  children,
  localStorageName,
  titleComponent,
  subTitleComponent,
  subChildrenComponent,
  topInfo,
  withTopMargin,
  noData,
  wrapperSx,
  tooltipOpen,
  paperSx,
  topInfoSx,
  onCollapseChange,
}: ListWrapperProps) => {
  const [isCollapse, setIsCollapse] = useState(
    localStorageName ? localStorage.getItem(localStorageName) === 'true' : false
  );
  const trackEvent = useRootStore((store) => store.trackEvent);

  const handleTrackingEvents = () => {
    if (!isCollapse) {
      switch (localStorageName as string | boolean) {
        case 'borrowAssetsDashboardTableCollapse':
          trackEvent(DASHBOARD.TILE_VISBILITY, {
            visibility: 'Hidden',
            type: 'Available Borrow Assets',
          });
          break;
        case 'borrowedAssetsDashboardTableCollapse':
          trackEvent(DASHBOARD.TILE_VISBILITY, { visibility: 'Hidden', type: 'Borrowed Assets' });
          break;
        case 'supplyAssetsDashboardTableCollapse':
          trackEvent(DASHBOARD.TILE_VISBILITY, {
            visibility: 'Hidden',
            type: 'Available Supply Assets',
          });
          break;
        case 'suppliedAssetsDashboardTableCollapse':
          trackEvent(DASHBOARD.TILE_VISBILITY, { visibility: 'Hidden', type: 'Supplied Assets' });
          break;
        default:
          return null;
      }
    } else {
      switch (localStorageName as string | boolean) {
        case 'borrowAssetsDashboardTableCollapse':
          trackEvent(DASHBOARD.TILE_VISBILITY, {
            visibility: 'Show',
            type: 'Available Borrow Assets',
          });
          break;
        case 'borrowedAssetsDashboardTableCollapse':
          trackEvent(DASHBOARD.TILE_VISBILITY, { visibility: 'Show', type: 'Borrowed Assets' });
          break;
        case 'supplyAssetsDashboardTableCollapse':
          trackEvent(DASHBOARD.TILE_VISBILITY, {
            visibility: 'Show',
            type: 'Available Supply Assets',
          });
          break;
        case 'suppliedAssetsDashboardTableCollapse':
          trackEvent(DASHBOARD.TILE_VISBILITY, { visibility: 'Show', type: 'Supplied Assets' });
          break;
        default:
          return null;
      }
    }
  };

  const collapsed = isCollapse && !noData;

  return (
    <Paper
      sx={{
        mt: withTopMargin ? 4 : 0,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.default',
        ...paperSx,
      }}
    >
      <Box
        sx={{
          px: { xs: 4, xsm: 6 },
          py: { xs: 3.5, xsm: 4 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          ...wrapperSx,
        }}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: { xs: 'flex-start', xsm: 'center' },
            py: '3.6px',
            flexDirection: { xs: 'column', xsm: 'row' },
          }}
        >
          {titleComponent}
          {subTitleComponent}
        </Box>

        {!!localStorageName && !noData && (
          <ButtonBase
            component="button"
            type="button"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              cursor: 'pointer',
              minHeight: '28px',
              pl: 3,
              gap: 1,
              color: 'text.secondary',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            onClick={() => {
              handleTrackingEvents();

              if (localStorageName && !noData) {
                const nextIsCollapse = !isCollapse;
                toggleLocalStorageClick(isCollapse, setIsCollapse, localStorageName);
                onCollapseChange?.(nextIsCollapse);
              }
            }}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Show list' : 'Hide list'}
          >
            <Typography component="span" variant="buttonM" color="inherit" sx={{ lineHeight: 1 }}>
              {collapsed ? <Trans>Show</Trans> : <Trans>Hide</Trans>}
            </Typography>
            <Box
              aria-hidden="true"
              sx={{
                position: 'relative',
                width: '14px',
                height: '14px',
                flexShrink: 0,
                '&::before, &::after': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  width: '100%',
                  height: '2px',
                  borderRadius: '999px',
                  bgcolor: 'currentColor',
                  transformOrigin: 'center',
                  transition: 'transform 0.2s ease, opacity 0.2s ease',
                },
                '&::before': {
                  transform: 'translateY(-50%)',
                },
                '&::after': {
                  transform: collapsed ? 'translateY(-50%) rotate(90deg)' : 'translateY(-50%) scaleX(0)',
                  opacity: collapsed ? 1 : 0,
                },
              }}
            />
          </ButtonBase>
        )}
      </Box>

      {topInfo && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: { xs: 4, xsm: 6 },
            pb: { xs: collapsed && !noData ? 6 : 2, xsm: collapsed && !noData ? 6 : 0 },
            overflowX: tooltipOpen ? 'hidden' : 'auto',
            ...topInfoSx,
          }}
        >
          {topInfo}
        </Box>
      )}
      {subChildrenComponent && !collapsed && (
        <Box sx={{ marginBottom: { xs: 2, xsm: 0 } }}>{subChildrenComponent}</Box>
      )}
      <Box sx={{ display: collapsed ? 'none' : 'block' }}>{children}</Box>
    </Paper>
  );
};
