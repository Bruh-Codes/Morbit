import { Box, Checkbox, FormControlLabel, SxProps } from '@mui/material';
import { useRootStore } from 'store/root';

import { toggleLocalStorageClick } from '../../helpers/toggle-local-storage-click';

interface DashboardListTopPanelProps {
  value: boolean;
  onClick: (value: boolean) => void;
  localStorageName: string;
  eventName: string;
  label: React.ReactNode;
  showBridge?: boolean;
  bridge?: { icon: string; name: string; url: string };
  sx?: SxProps;
}

export const DashboardListTopPanel = ({
  value,
  onClick,
  localStorageName,
  eventName,
  label,
  sx,
}: DashboardListTopPanelProps) => {
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: { xs: 'flex-start', xsm: 'center' },
        justifyContent: 'space-between',
        flexDirection: { xs: 'column-reverse', xsm: 'row' },
        px: { xs: 4, xsm: 6 },
        py: 2,
        pl: { xs: '18px', xsm: '27px' },
        ...sx,
      }}
    >
      <FormControlLabel
        sx={{ mt: { xs: 0, xsm: 0 } }}
        control={<Checkbox sx={{ p: '6px' }} />}
        checked={value}
        onChange={() => {
          trackEvent(eventName, {});

          toggleLocalStorageClick(value, onClick, localStorageName);
        }}
        label={label}
      />

    </Box>
  );
};
