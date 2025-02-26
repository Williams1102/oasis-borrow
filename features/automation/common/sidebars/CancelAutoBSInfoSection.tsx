import BigNumber from 'bignumber.js'
import { GasEstimation } from 'components/GasEstimation'
import { InfoSection } from 'components/infoSection/InfoSection'
import { AutoBSFormChange } from 'features/automation/common/state/autoBSFormChange'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface CancelAutoBSInfoSectionProps {
  positionRatio: BigNumber
  liquidationPrice: BigNumber
  debt: BigNumber
  title: string
  targetLabel: string
  triggerLabel: string
  autoBSState: AutoBSFormChange
}

export function CancelAutoBSInfoSection({
  positionRatio,
  liquidationPrice,
  debt,
  title,
  targetLabel,
  triggerLabel,
  autoBSState,
}: CancelAutoBSInfoSectionProps) {
  const { t } = useTranslation()
  const isDebtZero = debt.isZero()
  const readOnlyAutoBSEnabled = useFeatureToggle('ReadOnlyBasicBS')

  const liquidationPriceFormatted = formatAmount(liquidationPrice, 'USD')
  const positionRatioFormatted = formatPercent(positionRatio.times(100), {
    precision: 2,
  })
  const execCollRatioFormatted = formatPercent(autoBSState.execCollRatio, { precision: 2 })
  const targetCollRatioFormatted = formatPercent(autoBSState.targetCollRatio, { precision: 2 })

  return (
    <InfoSection
      title={title}
      items={[
        ...(isDebtZero || readOnlyAutoBSEnabled
          ? [
              {
                label: targetLabel,
                value: targetCollRatioFormatted,
                secondaryValue: '0%',
              },
              {
                label: triggerLabel,
                value: execCollRatioFormatted,
                secondaryValue: '0%',
              },
            ]
          : [
              {
                label: t('system.collateral-ratio'),
                value: positionRatioFormatted,
              },
              {
                label: t('system.liquidation-price'),
                value: `$${liquidationPriceFormatted}`,
              },
            ]),
        {
          label: t('auto-sell.estimated-transaction-cost'),
          value: <GasEstimation />,
        },
      ]}
    />
  )
}
