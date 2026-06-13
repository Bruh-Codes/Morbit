'use client';

import { Box } from '@mui/material';
import dynamic from 'next/dynamic';
import { GasStationProvider } from 'components/transactions/GasStation/GasStationProvider';
import { AppDataProvider } from 'hooks/app-data-provider/useAppDataProvider';
import { ModalContextProvider } from 'hooks/useModal';
import { AppHeader } from 'layouts/AppHeader';

const TransactionEventHandler = dynamic(
  () => import('components/TransactionEventHandler').then((m) => m.TransactionEventHandler),
  { ssr: false }
);
const SupportModal = dynamic(() => import('layouts/SupportModal').then((m) => m.SupportModal), {
  ssr: false,
});
const ReadModeStubModal = dynamic(
  () => import('components/transactions/StubModals').then((m) => m.ReadModeStubModal),
  { ssr: false }
);
const SwapStubModal = dynamic(
  () => import('components/transactions/StubModals').then((m) => m.SwapStubModal),
  { ssr: false }
);
const BorrowModal = dynamic(() =>
  import('components/transactions/Borrow/BorrowModal').then((module) => module.BorrowModal)
);
const RepayModal = dynamic(() =>
  import('components/transactions/Repay/RepayModal').then((module) => module.RepayModal)
);
const SupplyModal = dynamic(() =>
  import('components/transactions/Supply/SupplyModal').then((module) => module.SupplyModal)
);
const WithdrawModal = dynamic(() =>
  import('components/transactions/Withdraw/WithdrawModal').then((module) => module.WithdrawModal)
);
const CollateralChangeModal = dynamic(() =>
  import('components/transactions/CollateralChange/CollateralChangeModal').then(
    (module) => module.CollateralChangeModal
  )
);

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModalContextProvider>
      <AppDataProvider>
        <GasStationProvider>
          <AppHeader />
          <Box component="main" sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {children}
          </Box>
          <SupportModal />
          <SupplyModal />
          <WithdrawModal />
          <BorrowModal />
          <RepayModal />
          <CollateralChangeModal />
          <SwapStubModal />
          <ReadModeStubModal />
          <TransactionEventHandler />
        </GasStationProvider>
      </AppDataProvider>
    </ModalContextProvider>
  );
}
