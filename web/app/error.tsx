'use client';

import { DuplicateIcon, RefreshIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Button, Link, Paper, SvgIcon, Typography, useTheme } from '@mui/material';

export default function ErrorPage({ error: _error, reset }: { error: Error; reset: () => void }) {
  const theme = useTheme();

  const handleCopyError = () => {
    if (_error) console.error(_error);
  };

  return (
    <>
      <Box component="main" sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Paper
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            p: 4,
            flex: 1,
            backgroundColor: theme.palette.mode === 'dark' ? 'transparent' : '',
          }}
        >
          <Typography variant="display1" sx={{ mt: 8, mb: 3 }}>
            <Trans>Something went wrong</Trans>
          </Typography>
          <Typography sx={{ mt: 2, mb: 5, maxWidth: 480 }}>
            <Trans>
              Sorry, an unexpected error happened. In the meantime you may try reloading the page,
              or come back later.
            </Trans>
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={
              <SvgIcon>
                <RefreshIcon />
              </SvgIcon>
            }
            onClick={() => reset()}
            sx={{ mb: 10 }}
          >
            <Trans>Reload the page</Trans>
          </Button>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            mt={10}
          >
            <Typography sx={{ mb: 4 }}>
              <Trans>
                If the error continues to happen,
                <br /> you may report it to this
              </Trans>{' '}
              <Link href="https://discord.gg" color="inherit" target="_blank">
                <Trans>Discord channel</Trans>
              </Link>
              .
            </Typography>
            <Button
              color="primary"
              startIcon={
                <SvgIcon>
                  <DuplicateIcon />
                </SvgIcon>
              }
              onClick={handleCopyError}
            >
              <Trans>Copy error message</Trans>
            </Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
}
