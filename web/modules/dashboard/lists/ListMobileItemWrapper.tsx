import { ReactNode } from 'react';
import { BorrowDisabledToolTip } from 'components/infoTooltips/BorrowDisabledToolTip';
import { KernelAirdropTooltip } from 'components/infoTooltips/KernelAirdropTooltip';
import { OffboardingTooltip } from 'components/infoTooltips/OffboardingToolTip';
import { PausedTooltip } from 'components/infoTooltips/PausedTooltip';
import { SpkAirdropTooltip } from 'components/infoTooltips/SpkAirdropTooltip';
import { StETHCollateralToolTip } from 'components/infoTooltips/StETHCollateralToolTip';
import { SuperFestTooltip } from 'components/infoTooltips/SuperFestTooltip';
import { AssetsBeingOffboarded } from 'components/Warnings/OffboardingWarning';
import { CustomMarket } from 'ui-config/marketsConfig';
import { ExternalIncentivesTooltipsConfig } from 'utils/utils';

import { AMPLToolTip } from '../../../components/infoTooltips/AMPLToolTip';
import { FrozenTooltip } from '../../../components/infoTooltips/FrozenTooltip';
import { RenFILToolTip } from '../../../components/infoTooltips/RenFILToolTip';
import { ListMobileItem } from '../../../components/lists/ListMobileItem';

// These are all optional due to MobileListItemLoader
interface ListMobileItemWrapperProps {
  symbol?: string;
  iconSymbol?: string;
  name?: string;
  underlyingAsset?: string;
  children: ReactNode;
  loading?: boolean;
  currentMarket?: CustomMarket;
  frozen?: boolean;
  paused?: boolean;
  borrowEnabled?: boolean;
  showSupplyCapTooltips?: boolean;
  showBorrowCapTooltips?: boolean;
  showDebtCeilingTooltips?: boolean;
  isIsolated?: boolean;
  showExternalIncentivesTooltips?: ExternalIncentivesTooltipsConfig;
  onIconError?: () => void;
}

export const ListMobileItemWrapper = ({
  symbol,
  iconSymbol,
  name,
  children,
  underlyingAsset,
  loading,
  currentMarket,
  frozen,
  paused,
  borrowEnabled = true,
  showSupplyCapTooltips = false,
  showBorrowCapTooltips = false,
  showDebtCeilingTooltips = false,
  isIsolated = false,
  showExternalIncentivesTooltips = {
    superFestRewards: false,
    spkAirdrop: false,
    kernelPoints: false,
  },
  onIconError,
}: ListMobileItemWrapperProps) => {
  const WarningComponent: React.FC = () => {
    const showFrozenTooltip = frozen && symbol !== 'renFIL';
    const showRenFilTooltip = frozen && symbol === 'renFIL';
    const showAmplTooltip = !frozen && symbol === 'AMPL';
    const showstETHTooltip = symbol == 'stETH';
    const offboardingDiscussion =
      currentMarket && symbol ? AssetsBeingOffboarded[currentMarket]?.[symbol] : '';
    const showBorrowDisabledTooltip = !frozen && !borrowEnabled;
    return (
      <>
        {paused && <PausedTooltip />}
        {showExternalIncentivesTooltips.superFestRewards && <SuperFestTooltip />}
        {showExternalIncentivesTooltips.spkAirdrop && <SpkAirdropTooltip />}
        {showExternalIncentivesTooltips.kernelPoints && <KernelAirdropTooltip />}
        {showFrozenTooltip && <FrozenTooltip symbol={symbol} currentMarket={currentMarket} />}
        {showRenFilTooltip && <RenFILToolTip />}
        {showAmplTooltip && <AMPLToolTip />}
        {showstETHTooltip && <StETHCollateralToolTip />}
        {offboardingDiscussion && <OffboardingTooltip discussionLink={offboardingDiscussion} />}
        {showBorrowDisabledTooltip && symbol && currentMarket && (
          <BorrowDisabledToolTip symbol={symbol} currentMarket={currentMarket} />
        )}
      </>
    );
  };

  return (
    <ListMobileItem
      isIsolated={isIsolated}
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      underlyingAsset={underlyingAsset}
      warningComponent={<WarningComponent />}
      loading={loading}
      currentMarket={currentMarket}
      showSupplyCapTooltips={showSupplyCapTooltips}
      showBorrowCapTooltips={showBorrowCapTooltips}
      showDebtCeilingTooltips={showDebtCeilingTooltips}
      onIconError={onIconError}
    >
      {children}
    </ListMobileItem>
  );
};
