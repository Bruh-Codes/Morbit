'use client';

import dynamic from 'next/dynamic';
import { useWeb3Context } from 'libs/hooks/useWeb3Context';

const Dashboard = dynamic(() => import('./dashboard/page'), { ssr: false });
const Markets = dynamic(() => import('./markets/page'), { ssr: false });

export default function Home() {
  const { currentAccount } = useWeb3Context();
  return currentAccount ? <Dashboard /> : <Markets />;
}
