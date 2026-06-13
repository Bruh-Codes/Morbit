import { ComputedReserveData } from 'hooks/app-data-provider/useAppDataProvider';
import { ReserveIncentiveResponse } from 'protocol/aave-compat';

export type BorrowAssetsItem = {
  id: string;
  symbol: string;
  name: string;
  iconSymbol: string;
  underlyingAsset: string;
  variableBorrowRate: number | string;
  availableBorrows: number | string;
  availableBorrowsInUSD: number | string;
  isFreezed?: boolean;
  aIncentivesData?: ReserveIncentiveResponse[];
  vIncentivesData?: ReserveIncentiveResponse[];
  borrowCap: string;
  borrowableInIsolation: boolean;
  totalBorrows: string;
  totalLiquidityUSD: string;
  borrowingEnabled: boolean;
  isActive: boolean;
  eModeCategoryId: number;
};

export type GhoBorrowAssetsItem = {
  symbol: string;
  name: string;
  underlyingAsset: string;
  iconSymbol: string;
  availableBorrows: number | string;
  isFreezed?: boolean;
  aIncentivesData?: ReserveIncentiveResponse[];
  vIncentivesData?: ReserveIncentiveResponse[];
  reserve: ComputedReserveData;
};
