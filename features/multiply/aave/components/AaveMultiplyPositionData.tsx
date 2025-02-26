import { IPosition } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { DetailsSection } from 'components/DetailsSection'
import {
  DetailsSectionContentCard,
  DetailsSectionContentCardWrapper,
} from 'components/DetailsSectionContentCard'
import {
  DetailsSectionFooterItem,
  DetailsSectionFooterItemWrapper,
} from 'components/DetailsSectionFooterItem'
import { PreparedAaveReserveData } from 'features/aave/helpers/aavePrepareReserveData'
import { formatAmount, formatDecimalAsPercent } from 'helpers/formatters/format'
import { NaNIsZero } from 'helpers/nanIsZero'
import { useTranslation } from 'next-i18next'
import React from 'react'

type AaveMultiplyPositionDataProps = {
  currentPosition: IPosition
  nextPosition?: IPosition
  collateralTokenPrice: BigNumber
  debtTokenPrice: BigNumber
  collateralTokenReserveData: PreparedAaveReserveData
  debtTokenReserveData: PreparedAaveReserveData
}

const getLTVRatioColor = (ratio: BigNumber) => {
  const critical = new BigNumber(5)
  const warning = new BigNumber(20)

  switch (true) {
    case ratio.isLessThanOrEqualTo(critical):
      return 'critical10'
    case ratio.isLessThanOrEqualTo(warning):
      return 'warning10'
    default:
      return 'success10'
  }
}

export function AaveMultiplyPositionData({
  currentPosition,
  nextPosition,
  collateralTokenPrice,
  debtTokenPrice,
  collateralTokenReserveData,
  debtTokenReserveData,
}: AaveMultiplyPositionDataProps) {
  const { t } = useTranslation()

  const { collateral, debt, category, riskRatio } = currentPosition

  // collateral * usdprice * maxLTV - debt * usdprice
  const buyingPower = collateral.amount
    .times(collateralTokenPrice)
    .times(category.maxLoanToValue)
    .minus(debt.amount.times(debtTokenPrice))

  const newBuyingPower =
    nextPosition &&
    nextPosition.collateral.amount
      .times(collateralTokenPrice)
      .times(nextPosition.category.maxLoanToValue)
      .minus(nextPosition.debt.amount.times(collateralTokenPrice))

  // (collateral_amount * collateral_token_oracle_price - debt_token_amount * debt_token_oracle_price) / USDC_oracle_price
  const netValue = collateral.amount
    .times(collateralTokenPrice)
    .minus(debt.amount.times(debtTokenPrice))
  const newNetValue =
    nextPosition &&
    nextPosition.collateral.amount
      .times(collateralTokenPrice)
      .minus(nextPosition.debt.amount.times(debtTokenPrice))

  // collateral * multiple
  const totalExposure = collateral.amount
  const newTotalExposure = nextPosition && nextPosition.collateral.amount

  const liquidationPrice = NaNIsZero(currentPosition.liquidationPrice)
  const newLiquidationPrice =
    nextPosition?.liquidationPrice && NaNIsZero(nextPosition.liquidationPrice)

  const positionDebt = debt.amount
  const nextPositionDebt = nextPosition && nextPosition.debt.amount

  const multiple = riskRatio.multiple
  const newMultiple = nextPosition && nextPosition.riskRatio.multiple

  // VariableBorrowRate * debt_token_amount * debt_token_oracle_price - LiquidityRate * collateral_amount * collateral_token_oracle_price
  const netBorrowCost = debtTokenReserveData.variableBorrowRate
    .times(debt.amount)
    .times(debtTokenPrice)
    .minus(
      collateralTokenReserveData.liquidityRate.times(collateral.amount).times(collateralTokenPrice),
    )

  return (
    <DetailsSection
      title={t('system.overview')}
      content={
        <DetailsSectionContentCardWrapper>
          <DetailsSectionContentCard
            title={t('system.liquidation-price')}
            value={`${formatAmount(liquidationPrice.times(collateralTokenPrice), 'USD')} USDC`}
            footnote={`${t('manage-earn-vault.below-current-price', {
              percentage: formatDecimalAsPercent(
                liquidationPrice.minus(debtTokenPrice).dividedBy(debtTokenPrice).absoluteValue(),
              ),
            })}`}
            change={
              newLiquidationPrice && {
                variant: newLiquidationPrice.gt(liquidationPrice) ? 'positive' : 'negative',
                value: `$${formatAmount(newLiquidationPrice, 'USD')} ${t('after')}`,
              }
            }
          />
          <DetailsSectionContentCard
            title={t('system.loan-to-value')}
            value={formatDecimalAsPercent(riskRatio.loanToValue)}
            footnote={`${t('manage-earn-vault.liquidation-threshold', {
              percentage: formatDecimalAsPercent(category.liquidationThreshold),
            })}`}
            customBackground={
              !nextPosition?.riskRatio
                ? getLTVRatioColor(
                    category.liquidationThreshold.minus(riskRatio.loanToValue).times(100),
                  )
                : 'transparent'
            }
            change={
              nextPosition?.riskRatio && {
                variant: nextPosition.riskRatio.loanToValue.gt(riskRatio.loanToValue)
                  ? 'positive'
                  : 'negative',
                value: `${formatDecimalAsPercent(category.liquidationThreshold)} ${t('after')}`,
              }
            }
          />
          <DetailsSectionContentCard
            title={t('system.net-borrow-cost')}
            value={formatDecimalAsPercent(netBorrowCost)}
          />
          <DetailsSectionContentCard
            title={t('system.net-value')}
            value={`${formatAmount(netValue, 'USD')} USDC`}
            change={
              newNetValue && {
                variant: newNetValue.gt(netValue) ? 'positive' : 'negative',
                value: `${formatAmount(newNetValue, 'USD')} ${t('after')}`,
              }
            }
          />
        </DetailsSectionContentCardWrapper>
      }
      footer={
        <DetailsSectionFooterItemWrapper>
          <DetailsSectionFooterItem
            title={t('system.position-debt')}
            value={`${formatAmount(positionDebt, 'USD')} USDC`}
            change={
              nextPositionDebt && {
                variant: nextPositionDebt.gt(positionDebt) ? 'positive' : 'negative',
                value: `${formatAmount(nextPositionDebt, 'USD')} USDC ${t('after')}`,
              }
            }
          />
          <DetailsSectionFooterItem
            title={t('system.total-exposure', { token: collateral.denomination })}
            value={`${formatAmount(totalExposure, 'ETH')} ETH`}
            change={
              newTotalExposure && {
                variant: newTotalExposure.gt(totalExposure) ? 'positive' : 'negative',
                value: `${formatAmount(newTotalExposure, 'ETH')} ETH ${t('after')}`,
              }
            }
          />
          <DetailsSectionFooterItem
            title={t('system.multiple')}
            value={`${multiple.toFormat(1, BigNumber.ROUND_DOWN)}x`}
            change={
              newMultiple && {
                variant: newMultiple.gt(multiple) ? 'positive' : 'negative',
                value: `${newMultiple.toFormat(1, BigNumber.ROUND_DOWN)}x ${t('after')}`,
              }
            }
          />
          <DetailsSectionFooterItem
            title={t('system.buying-power')}
            value={`${formatAmount(buyingPower, 'USD')} USDC`}
            change={
              newBuyingPower && {
                variant: newBuyingPower.gt(buyingPower) ? 'positive' : 'negative',
                value: `${formatAmount(newBuyingPower, 'USD')} USDC ${t('after')}`,
              }
            }
          />
        </DetailsSectionFooterItemWrapper>
      }
    />
  )
}
