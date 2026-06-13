'use client';

import { XIcon } from '@heroicons/react/outline';
import {
  Button,
  IconButton,
  Modal,
  Paper,
  SvgIcon,
  Typography,
} from '@mui/material';
import { ModalType, useModalContext } from 'hooks/useModal';

export function SwapStubModal() {
  const { type, close } = useModalContext();

  return (
    <Modal
      open={type === ModalType.Swap}
      onClose={close}
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Paper sx={{ position: 'relative', p: 6, maxWidth: 420, width: '100%', mx: 2 }}>
        <IconButton
          onClick={close}
          sx={{ position: 'absolute', top: 24, right: 24 }}
        >
          <SvgIcon sx={{ fontSize: 28 }}>
            <XIcon />
          </SvgIcon>
        </IconButton>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Swap
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Swap functionality will be available soon.
        </Typography>
        <Button onClick={close} variant="contained" fullWidth>
          Close
        </Button>
      </Paper>
    </Modal>
  );
}

export function ReadModeStubModal() {
  const { type, close } = useModalContext();

  return (
    <Modal
      open={type === ModalType.ReadMode}
      onClose={close}
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Paper sx={{ position: 'relative', p: 6, maxWidth: 420, width: '100%', mx: 2 }}>
        <IconButton onClick={close} sx={{ position: 'absolute', top: 24, right: 24 }}>
          <SvgIcon sx={{ fontSize: 28 }}>
            <XIcon />
          </SvgIcon>
        </IconButton>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Watch wallet
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Watch wallet functionality will be available soon.
        </Typography>
        <Button onClick={close} variant="contained" fullWidth>
          Close
        </Button>
      </Paper>
    </Modal>
  );
}
