import { Icon } from '@makerdao/dai-ui-icons'
import { getToken } from 'blockchain/tokensMetadata'
import { GuniManageMultiplyVaultChangesInformation } from 'features/earn/guni/manage/containers/GuniManageMultiplyVaultChangesInformation'
import { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

export function SidebarManageGuniVaultEditingState(props: ManageMultiplyVaultState) {
  const { t } = useTranslation()

  const {
    afterCloseToDai,
    vault: { debt },
  } = props

  return (
    <Grid gap={3}>
      <Text variant="paragraph3" sx={{ color: 'text.subtitle' }}>
        {t('vault-info-messages.closing')}
      </Text>
      {!debt.isZero() && (
        <>
          <Text
            as="p"
            variant="paragraph3"
            sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, fontWeight: 'semiBold' }}
          >
            <Text
              as="span"
              sx={{ display: 'flex', alignItems: 'flex-end', color: 'text.subtitle' }}
            >
              <Icon name={getToken('DAI').iconCircle} size="20px" sx={{ mr: 1 }} />
              {t('minimum')} {t('after-closing', { token: 'DAI' })}
            </Text>
            <Text as="span">{formatCryptoBalance(afterCloseToDai)} DAI</Text>
          </Text>
          <GuniManageMultiplyVaultChangesInformation {...props} />
        </>
      )}
    </Grid>
  )
}