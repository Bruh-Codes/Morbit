import { Trans } from '@lingui/macro';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Box, SvgIcon, Tooltip, Typography } from '@mui/material';
import { Fragment } from 'react';
import { LiquidationPenaltyTooltip } from 'components/infoTooltips/LiquidationPenaltyTooltip';
import { LiquidationThresholdTooltip } from 'components/infoTooltips/LiquidationThresholdTooltip';
import { MaxLTVTooltip } from 'components/infoTooltips/MaxLTVTooltip';
import { FormattedNumber } from 'components/primitives/FormattedNumber';
import { Link, ROUTES } from 'components/primitives/Link';
import { ReserveOverviewBox } from 'components/ReserveOverviewBox';
import { ReserveWithId } from 'hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'store/root';
import { GENERAL, RESERVE_DETAILS } from 'utils/events';
import { replaceUnderscoresWithSpaces } from 'utils/utils';

import LightningBoltGradient from '../../public/lightningBoltGradient.svg';
import { PanelRow, PanelTitle } from './ReservePanels';

type ReserverEModePanelProps = {
  reserve: ReserveWithId;
};

export const ReserveEModePanel: React.FC<ReserverEModePanelProps> = ({ reserve }) => {
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <PanelRow>
      <PanelTitle>E-Mode info</PanelTitle>
      <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: '100%', width: '100%' }}>
        {reserve.eModeInfo?.map((e: any) => (
          <Fragment key={e.label}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <SvgIcon sx={{ fontSize: '14px', mr: 0.5, ml: 2 }}>
                <LightningBoltGradient />
              </SvgIcon>
              <Typography variant="subheader1">{replaceUnderscoresWithSpaces(e.label)}</Typography>
              <ConfigStatus
                enabled={e.canBeCollateral}
                label="Collateral"
                warning={e.canBeCollateral && e.hasLtvZero}
              />
              <ConfigStatus enabled={e.canBeBorrowed} label="Borrowable" />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                pt: '12px',
              }}
            >
              <ReserveOverviewBox
                title={<MaxLTVTooltip variant="description" text={<Trans>Max LTV</Trans>} />}
              >
                <FormattedNumber
                  value={e.hasLtvZero ? 0 : e.maxLTV.value}
                  percent
                  variant="secondary14"
                  visibleDecimals={2}
                />
              </ReserveOverviewBox>
              <ReserveOverviewBox
                title={
                  <LiquidationThresholdTooltip
                    variant="description"
                    text={<Trans>Liquidation threshold</Trans>}
                  />
                }
              >
                <FormattedNumber
                  value={e.liquidationThreshold.value}
                  percent
                  variant="secondary14"
                  visibleDecimals={2}
                />
              </ReserveOverviewBox>
              <ReserveOverviewBox
                title={
                  <LiquidationPenaltyTooltip
                    variant="description"
                    text={<Trans>Liquidation penalty</Trans>}
                  />
                }
              >
                <FormattedNumber
                  value={e.liquidationPenalty.value}
                  percent
                  variant="secondary14"
                  visibleDecimals={2}
                />
              </ReserveOverviewBox>
            </Box>
          </Fragment>
        ))}

        <Typography variant="caption" color="text.secondary" paddingTop="24px">
          <Trans>
            E-Mode increases your LTV for a selected category of assets, meaning that when E-mode is
            enabled, you will have higher borrowing power over assets of the same E-mode category
            which are defined by protocol governance. You can enter E-Mode from your{' '}
            <Link
              href={ROUTES.dashboard}
              sx={{ textDecoration: 'underline' }}
              variant="caption"
              color="text.secondary"
              onClick={() => {
                trackEvent(RESERVE_DETAILS.GO_DASHBOARD_EMODE);
              }}
            >
              Dashboard
            </Link>
            . To learn more about E-Mode and applied restrictions, see the{' '}
            <Link
              href="/"
              sx={{ textDecoration: 'underline' }}
              variant="caption"
              color="text.secondary"
              onClick={() => {
                trackEvent(GENERAL.EXTERNAL_LINK, { Link: 'E-mode FAQ' });
              }}
            >
              help guide
            </Link>{' '}
            or the technical paper. .
          </Trans>
        </Typography>
      </Box>
    </PanelRow>
  );
};

export const ConfigStatus = ({
  enabled,
  label,
  warning,
  warningTooltip,
}: {
  enabled: boolean;
  label?: string;
  warning?: boolean;
  warningTooltip?: React.ReactNode;
}) => {
  const defaultWarningTooltip = (
    <Trans>
      This asset has 0% LTV, meaning it does not contribute to borrowing power. Existing positions
      with this asset as collateral still count toward the liquidation threshold and protect your
      health factor. New positions cannot enable this asset as collateral.
    </Trans>
  );

  return (
    <>
      {warning ? (
        <Tooltip title={warningTooltip || defaultWarningTooltip} arrow placement="top">
          <WarningAmberIcon fontSize="small" color="warning" sx={{ ml: 2, cursor: 'help' }} />
        </Tooltip>
      ) : enabled ? (
        <CheckRoundedIcon fontSize="small" color="success" sx={{ ml: 2 }} />
      ) : (
        <CloseIcon fontSize="small" color="error" sx={{ ml: 2 }} />
      )}
      {label && (
        <Typography
          variant="subheader1"
          sx={{ color: warning ? '#E8A838' : enabled ? '#46BC4B' : '#F24E4E' }}
        >
          <Trans>{label}</Trans>
        </Typography>
      )}
    </>
  );
};
