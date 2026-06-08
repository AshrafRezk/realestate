import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { DEMO_CONFIG } from '../../lib/demo-config'

const SAKANI_LOGO = '/SakaniLogo.jpg'
const MOD_LOGO = '/Saudi_Ministry_of_Defense_Logo.svg.png'

interface SubsidyBadgesProps {
  eligible?: boolean
  size?: 'small' | 'medium' | 'large'
}

const SIZE_STYLES = {
  small: { height: 22, padding: 0.25, sakaniMax: 56, modMax: 28 },
  medium: { height: 32, padding: 0.5, sakaniMax: 80, modMax: 40 },
  large: { height: 42, padding: 0.75, sakaniMax: 110, modMax: 52 },
} as const

export default function SubsidyBadges({ eligible, size = 'small' }: SubsidyBadgesProps) {
  const { t } = useTranslation()

  if (!eligible || !DEMO_CONFIG.features.showSubsidyBadges) return null

  const { height, padding, sakaniMax, modMax } = SIZE_STYLES[size]

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        bgcolor: 'rgba(255,255,255,0.95)',
        borderRadius: 1,
        px: padding,
        py: padding * 0.5,
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      }}
      aria-label={t('unit.eligibleForSubsidies', 'Eligible for subsidies')}
    >
      <Box
        component="img"
        src={SAKANI_LOGO}
        alt={t('unit.sakaniBadge', 'Sakani')}
        sx={{ height, width: 'auto', maxWidth: sakaniMax, objectFit: 'contain', display: 'block' }}
      />
      <Box
        component="img"
        src={MOD_LOGO}
        alt={t('unit.modBadge', 'Ministry of Defense')}
        sx={{ height, width: 'auto', maxWidth: modMax, objectFit: 'contain', display: 'block' }}
      />
    </Box>
  )
}
