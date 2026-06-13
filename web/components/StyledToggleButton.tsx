import { styled, ToggleButton, ToggleButtonProps } from '@mui/material';

const CustomToggleButton = styled(ToggleButton)<ToggleButtonProps>(({ theme: _theme }) => ({
  border: '0px',
  flex: 1,
  backgroundColor: '#1A1A1A',
  borderRadius: '4px',

  '&.Mui-selected, &.Mui-selected:hover': {
    backgroundColor: '#CCFF00',
    borderRadius: '4px !important',
  },

  '&.Mui-selected, &.Mui-disabled': {
    zIndex: 100,
    height: '100%',
    display: 'flex',
    justifyContent: 'center',

    '.MuiTypography-subheader1': {
      color: '#0A0A0A',
      background: 'none',
      backgroundClip: 'unset',
      textFillColor: 'unset',
    },
    '.MuiTypography-secondary14': {
      color: '#0A0A0A',
      background: 'none',
      backgroundClip: 'unset',
      textFillColor: 'unset',
    },
  },
})) as typeof ToggleButton;

const CustomTxModalToggleButton = styled(ToggleButton)<ToggleButtonProps>(({ theme }) => ({
  border: '0px',
  flex: 1,
  color: theme.palette.text.muted,
  borderRadius: '4px',

  // Selected (active) state
  '&.Mui-selected, &.Mui-selected:hover': {
    border: `1px solid ${theme.palette.other.standardInputLine}`,
    backgroundColor: '#FFFFFF',
    borderRadius: '4px !important',
    color: theme.palette.background.header,
    zIndex: 100,
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
  },

  // Disabled but NOT selected: keep readable text with slight fade
  '&.Mui-disabled:not(.Mui-selected)': {
    color: theme.palette.text.secondary,
    opacity: 0.55,
  },

  // Disabled + selected: preserve the selected look
  '&.Mui-disabled.Mui-selected': {
    border: `1px solid ${theme.palette.other.standardInputLine}`,
    backgroundColor: '#FFFFFF',
    borderRadius: '4px !important',
    color: theme.palette.background.header,
    opacity: 1,
  },
})) as typeof ToggleButton;

export function StyledTxModalToggleButton(props: ToggleButtonProps) {
  return <CustomTxModalToggleButton {...props} />;
}

export default function StyledToggleButton(props: ToggleButtonProps) {
  return <CustomToggleButton {...props} />;
}
