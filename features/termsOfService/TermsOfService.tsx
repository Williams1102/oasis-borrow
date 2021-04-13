// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { Modal, ModalErrorMessage } from 'components/Modal'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React, { ReactNode, useState } from 'react'
import { Box, Button, Flex, Heading, Label, Text } from 'theme-ui'

import { TermsAcceptanceStage, TermsAcceptanceState } from './termsAcceptance'

interface WithTermsOfServiceProps {
  children: ReactNode
}

function getStageErrorMessage(stage: TermsAcceptanceStage) {
  switch (stage) {
    case 'acceptanceCheckFailed':
      return 'acceptance-check-failed'
    case 'acceptanceSaveFailed':
      return 'acceptance-save-failed'
    case 'jwtAuthFailed':
      return 'jwt-auth-failed'
    case 'jwtAuthRejected':
      return 'jwt-auth-rejected'
    default:
      return ''
  }
}

function getButtonMessage(stage: TermsAcceptanceStage) {
  switch (stage) {
    case 'jwtAuthInProgress':
      return 'jwt-auth-in-progress'
    case 'acceptanceSaveInProgress':
      return 'acceptance-save-in-progress'
    default:
      return 'jwt-auth-waiting-acceptance'
  }
}

function TOSWaiting4Signature({ stage, acceptJwtAuth, updated }: TermsAcceptanceState) {
  const { t } = useTranslation('common')

  return (
    <>
      <Box px={2}>
        <Heading sx={{ textAlign: 'center', pb: 1, pt: 3, fontSize: 7 }}>
          {t(`tos-welcome${updated ? '-updated' : ''}`)}
        </Heading>
        <Text mt={3} sx={{ fontWeight: '400', fontSize: '14px' }}>
          {t('tos-jwt-signature-message')}
        </Text>
      </Box>
      <Button
        sx={{ width: '80%' }}
        disabled={stage !== 'jwtAuthWaiting4Acceptance'}
        onClick={acceptJwtAuth}
      >
        {t(getButtonMessage(stage))}
      </Button>
    </>
  )
}

function TOSWaiting4Acceptance({ stage, acceptTOS, updated }: TermsAcceptanceState) {
  const [checked, setChecked] = useState(false)
  const { t } = useTranslation('common')

  return (
    <>
      <Box px={3}>
        <Heading sx={{ textAlign: 'center', pb: 1, pt: 3, fontSize: 7 }}>
          {t(`tos-welcome${updated ? '-updated' : ''}`)}
        </Heading>
        <Text sx={{ mt: 3, fontSize: '14px', textAlign: 'justify' }}>
          {t(`tos-accept-message${updated ? '-updated' : ''}`)}
        </Text>
        <AppLink
          href="/terms"
          withAccountPrefix={false}
          internalInNewTab
          passHref
          sx={{
            display: 'flex',
            mt: 2,
            mb: 4,
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
          }}
        >
          <Text mt={3}>{t('tos-view')}</Text>
        </AppLink>
        <Box px={2} sx={{ background: '#f6f8f9', borderRadius: '12px', p: 3, mb: 4 }}>
          <Label
            sx={{ fontSize: 3, fontWeight: 'body', cursor: 'pointer' }}
            onClick={() => setChecked(!checked)}
          >
            <Flex
              sx={{
                position: 'relative',
                top: '8px',
                width: '25px',
                height: '25px',
                border: 'light',
                borderColor: 'primary',
                borderRadius: 'small',
                alignItems: 'center',
                justifyContent: 'center',
                ...(checked && {
                  bg: 'primary',
                }),
              }}
            >
              {checked && <Icon name="checkmark" color="surface" />}
            </Flex>
            <Text ml={3} sx={{ flex: 1, fontWeight: '400', fontSize: '14px' }}>
              {t('tos-read')}
            </Text>
          </Label>
        </Box>
      </Box>
      <Button
        sx={{ width: '80%' }}
        disabled={!checked || stage !== 'acceptanceWaiting4TOSAcceptance'}
        onClick={acceptTOS}
      >
        {t('continue')}
      </Button>
    </>
  )
}

function TOSErrorScreen({
  tryAgain,
  message,
}: TermsAcceptanceState & {
  message: string
}) {
  const { t } = useTranslation('common')

  return (
    <>
      <ModalErrorMessage {...{ message }} />
      <Button sx={{ width: '80%' }} onClick={tryAgain}>
        {t('try-again')}
      </Button>
    </>
  )
}

const hiddenStages: TermsAcceptanceStage[] = [
  'acceptanceAccepted',
  'walletConnectionInProgress',
  'acceptanceCheckInProgress',
]

export function TermsOfService() {
  const { termsAcceptance$ } = useAppContext()
  const termsAcceptance = useObservable(termsAcceptance$)

  if (!termsAcceptance || hiddenStages.includes(termsAcceptance.stage)) return null

  return (
    <Modal sx={{ maxWidth: '400px', margin: '0px auto' }}>
      <Flex
        p={3}
        sx={{
          minHeight: termsAcceptance.updated ? '400px' : '290px',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'space-between',
          px: 3,
        }}
      >
        {(() => {
          switch (termsAcceptance.stage) {
            case 'acceptanceWaiting4TOSAcceptance':
              return <TOSWaiting4Acceptance {...termsAcceptance} />
            case 'jwtAuthWaiting4Acceptance':
            case 'jwtAuthInProgress':
            case 'acceptanceSaveInProgress':
              return <TOSWaiting4Signature {...termsAcceptance} />
            case 'acceptanceCheckFailed':
            case 'jwtAuthFailed':
            case 'jwtAuthRejected':
            case 'acceptanceSaveFailed':
              return (
                <TOSErrorScreen
                  {...{ ...termsAcceptance, message: getStageErrorMessage(termsAcceptance.stage) }}
                />
              )
            default:
              return null
          }
        })()}
      </Flex>
    </Modal>
  )
}

export function WithTermsOfService({ children }: WithTermsOfServiceProps) {
  const { termsAcceptance$, web3ContextConnected$ } = useAppContext()
  const web3ContextConnected = useObservable(web3ContextConnected$)
  const termsAcceptance = useObservable(termsAcceptance$)

  if (!termsAcceptance || !web3ContextConnected) {
    return null
  }

  if (web3ContextConnected.status === 'connectedReadonly') {
    return <>{children}</>
  }

  return (
    <>
      {children}
      <TermsOfService />
    </>
  )
}