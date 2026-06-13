'use client';

import { Trans } from '@lingui/macro';
import { Box, Button, Paper, Typography, useTheme } from '@mui/material';
import Link from 'next/link';

export default function NotFound() {
  const theme = useTheme();

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
          <Box sx={{ maxWidth: 444, m: '0 auto' }}>
            <img width="100%" height="auto" src="/404/404.svg" alt="404 - Page not found" />
          </Box>
          <Typography variant="display1" sx={{ mt: 2 }}>
            <Trans>Page not found</Trans>
          </Typography>
          <Typography sx={{ mt: 3, mb: 5, maxWidth: 480 }}>
            <Trans>Sorry, we couldn&apos;t find the page you were looking for.</Trans>
            <br />
            <Trans>We suggest you go back to the home page.</Trans>
          </Typography>
          <Link href="/" passHref>
            <Button variant="outlined" color="primary">
              <Trans>Back home</Trans>
            </Button>
          </Link>
        </Paper>
      </Box>
    </>
  );
}
