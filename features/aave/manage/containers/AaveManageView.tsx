import { useActor } from '@xstate/react'
import { AaveReserveConfigurationData } from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { TabBar } from 'components/TabBar'
import { ProtectionControl } from 'components/vault/ProtectionControl'
import { isSupportedAutomationTokenPair } from 'features/automation/common/helpers'
import { AaveAutomationContext } from 'features/automation/contexts/AaveAutomationContext'
import { AaveFaq } from 'features/content/faqs/aave'
import { useEarnContext } from 'features/earn/EarnContextProvider'
import { Survey } from 'features/survey'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Container, Grid } from 'theme-ui'

import { PositionOwnershipBanner } from '../../../notices/VaultsNoticesView'
import { useAaveContext } from '../../AaveContextProvider'
import { StrategyConfig } from '../../common/StrategyConfigTypes'
import { PreparedAaveReserveData } from '../../helpers/aavePrepareReserveData'
import { SidebarManageAaveVault } from '../sidebars/SidebarManageAaveVault'
import {
  ManageAaveStateMachineContextProvider,
  useManageAaveStateMachineContext,
} from './AaveManageStateMachineContext'

interface AaveManageViewPositionViewProps {
  address: string
  strategyConfig: StrategyConfig
}

function PositionOwnership() {
  const { stateMachine } = useManageAaveStateMachineContext()
  const [state] = useActor(stateMachine)

  const connectedAddress =
    state.context.web3Context?.status === 'connected'
      ? state.context.web3Context.account
      : undefined

  if (
    state.context.connectedProxyAddress !== undefined &&
    state.context.proxyAddress !== undefined &&
    state.context.connectedProxyAddress === state.context.proxyAddress
  ) {
    return null
  }
  return (
    <PositionOwnershipBanner
      account={state.context.address}
      connectedWalletAddress={connectedAddress}
    />
  )
}

function AaveManageContainer({
  strategyConfig,
  aaveReserveState,
  aaveReserveDataETH,
  address,
}: {
  aaveReserveState: AaveReserveConfigurationData
  aaveReserveDataETH: PreparedAaveReserveData
  strategyConfig: StrategyConfig
  address: string
}) {
  const { t } = useTranslation()
  const Header = strategyConfig.viewComponents.headerManage
  const VaultDetails = strategyConfig.viewComponents.vaultDetailsManage
  const { stateMachine } = useManageAaveStateMachineContext()
  const [state] = useActor(stateMachine)
  const aaveProtection = useFeatureToggle('AaveProtection')

  if (!state.context.protocolData) {
    return null
  }

  const { collateralToken, token } = state.context
  const showAutomationTabs = isSupportedAutomationTokenPair(collateralToken, token)

  return (
    <AaveAutomationContext
      aaveManageVault={{
        address,
        aaveReserveState,
        aaveReserveDataETH,
        strategyConfig,
        context: state.context,
      }}
    >
      <Container variant="vaultPageContainer">
        <PositionOwnership />
        <Header strategyConfig={strategyConfig} />
        <TabBar
          variant="underline"
          sections={[
            {
              value: 'overview',
              label: t('system.overview'),
              content: (
                <Grid variant="vaultContainer">
                  <Box>
                    <VaultDetails
                      aaveReserveState={aaveReserveState}
                      aaveReserveDataETH={aaveReserveDataETH}
                      strategyConfig={strategyConfig}
                      currentPosition={state.context.currentPosition}
                      collateralPrice={state.context.collateralPrice}
                      tokenPrice={state.context.tokenPrice}
                      nextPosition={state.context.strategy?.simulation.position}
                    />
                  </Box>
                  <Box>{<SidebarManageAaveVault />}</Box>
                </Grid>
              ),
            },
            {
              value: 'position-info',
              label: t('system.position-info'),
              content: (
                <Card variant="faq">
                  <AaveFaq />
                </Card>
              ),
            },
            ...(aaveProtection && showAutomationTabs
              ? [
                  {
                    label: t('system.protection'),
                    value: 'protection',
                    tag: { include: true, active: false },
                    content: <ProtectionControl />,
                  },
                ]
              : []),
          ]}
        />
        <Survey for="earn" />
      </Container>
    </AaveAutomationContext>
  )
}

export function AaveManagePositionView({
  address,
  strategyConfig,
}: AaveManageViewPositionViewProps) {
  const { aaveManageStateMachine } = useAaveContext()
  const { aaveSTETHReserveConfigurationData, aavePreparedReserveDataETH$ } = useEarnContext()
  const [aaveReserveDataETH] = useObservable(aavePreparedReserveDataETH$)
  const [aaveReserveState, aaveReserveStateError] = useObservable(aaveSTETHReserveConfigurationData)
  return (
    <ManageAaveStateMachineContextProvider
      machine={aaveManageStateMachine}
      address={address}
      strategy={strategyConfig}
    >
      <WithErrorHandler error={[aaveReserveStateError]}>
        <WithLoadingIndicator
          value={[aaveReserveState, aaveReserveDataETH]}
          customLoader={<VaultContainerSpinner />}
        >
          {([_aaveReserveState, _aaveReserveDataETH]) => {
            return (
              <AaveManageContainer
                strategyConfig={strategyConfig}
                aaveReserveState={_aaveReserveState}
                aaveReserveDataETH={_aaveReserveDataETH}
                address={address}
              />
            )
          }}
        </WithLoadingIndicator>
      </WithErrorHandler>
    </ManageAaveStateMachineContextProvider>
  )
}
