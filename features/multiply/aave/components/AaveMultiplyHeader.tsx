import BigNumber from 'bignumber.js'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { HeadlineDetailsProp } from 'components/vault/VaultHeadlineDetails'
import { useAaveContext } from 'features/aave/AaveContextProvider'
import { StrategyConfig } from 'features/aave/common/StrategyConfigTypes'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatAmount } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React from 'react'

function AaveMultiplyHeader({
  strategyConfig,
  headerLabelString,
}: {
  strategyConfig: StrategyConfig
  headerLabelString: string
}) {
  const { t } = useTranslation()
  const { getAaveAssetsPrices$, chainlinkUSDCUSDOraclePrice$ } = useAaveContext()
  const [positionTokenPrices, positionTokenPricesError] = useObservable(
    getAaveAssetsPrices$({
      tokens: [strategyConfig.tokens.debt, strategyConfig.tokens.collateral],
    }),
  )
  const [chainlinkUSDCUSDPrice, chainlinkUSDCUSDPriceError] = useObservable(
    chainlinkUSDCUSDOraclePrice$(),
  )

  const detailsList: HeadlineDetailsProp[] = []
  if (positionTokenPrices && chainlinkUSDCUSDPrice) {
    const [debtTokenPrice, collateralTokenPrice] = positionTokenPrices

    detailsList.push(
      {
        label: t('system.current-token-price', { token: strategyConfig.tokens.collateral }),
        value: `$${formatAmount(
          collateralTokenPrice.div(debtTokenPrice).times(chainlinkUSDCUSDPrice),
          'USD',
        )}`,
      },
      {
        label: t('system.current-token-price', { token: strategyConfig.tokens.debt }),
        value: `$${formatAmount(new BigNumber(chainlinkUSDCUSDPrice), 'USDC')}`,
      },
    )
  }

  return (
    <WithErrorHandler error={[positionTokenPricesError, chainlinkUSDCUSDPriceError]}>
      <VaultHeadline
        header={t(headerLabelString, { ...strategyConfig.tokens })}
        token={[strategyConfig.tokens.collateral, strategyConfig.tokens.debt]}
        loading={!positionTokenPrices}
        details={detailsList}
      />
    </WithErrorHandler>
  )
}

export function AaveMultiplyOpenHeader({ strategyConfig }: { strategyConfig: StrategyConfig }) {
  return (
    <AaveMultiplyHeader
      strategyConfig={strategyConfig}
      headerLabelString={'vault.header-aave-open'}
    />
  )
}

export function AaveMultiplyManageHeader({ strategyConfig }: { strategyConfig: StrategyConfig }) {
  return (
    <AaveMultiplyHeader strategyConfig={strategyConfig} headerLabelString={'header-aave-view'} />
  )
}
