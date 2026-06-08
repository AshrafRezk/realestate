import { Box, Button, IconButton, Tooltip } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Phone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { COMPANY_PHONE_TEL, COMPANY_WHATSAPP_URL } from '../../lib/contact'

const WhatsAppIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.04 2C6.55 2 2.08 6.47 2.08 11.96c0 1.77.46 3.5 1.33 5.02L2 22l5.15-1.35a9.9 9.9 0 0 0 4.89 1.25h.01c5.49 0 9.96-4.47 9.96-9.96C22.01 6.47 17.54 2 12.04 2Zm0 17.99h-.01a8.3 8.3 0 0 1-4.22-1.16l-.3-.18-3.06.8.82-2.98-.2-.31a8.26 8.26 0 0 1-1.26-4.4c0-4.58 3.73-8.3 8.31-8.3 4.58 0 8.31 3.72 8.31 8.3 0 4.58-3.73 8.3-8.39 8.3Zm4.82-6.2c-.26-.13-1.53-.75-1.77-.84-.24-.09-.41-.13-.58.13-.17.26-.67.84-.82 1.01-.15.17-.3.2-.56.07-.26-.13-1.08-.4-2.06-1.27-.76-.68-1.27-1.52-1.42-1.78-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.58-1.39-.79-1.9-.21-.5-.43-.43-.58-.44h-.5c-.17 0-.45.06-.69.32-.24.26-.9.88-.9 2.15 0 1.27.92 2.5 1.05 2.68.13.17 1.81 2.76 4.38 3.87.61.26 1.08.42 1.45.54.61.19 1.16.16 1.6.1.49-.07 1.53-.62 1.75-1.22.22-.6.22-1.12.15-1.22-.06-.1-.23-.16-.49-.29Z" />
  </svg>
)

const actionButtonSx = {
  color: '#ffffff',
  fontWeight: 600,
  fontSize: '0.75rem',
  textTransform: 'none' as const,
  minWidth: 0,
  px: { xs: 1, sm: 1.25 },
  py: 0.75,
  borderRadius: 1.5,
  border: 1,
  borderColor: 'rgba(255,255,255,0.4)',
  '&:hover': {
    bgcolor: 'rgba(255,255,255,0.1)',
    borderColor: '#ffffff',
  },
}

type NavContactActionsProps = {
  /** Compact icon-only buttons (e.g. tight header on small screens). */
  compact?: boolean
}

export default function NavContactActions({ compact = false }: NavContactActionsProps) {
  const { t } = useTranslation()

  const callLabel = t('common.call', 'Call')
  const whatsappLabel = t('share.whatsapp', 'WhatsApp')

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Tooltip title={callLabel}>
          <IconButton
            component="a"
            href={COMPANY_PHONE_TEL}
            size="small"
            aria-label={callLabel}
            sx={{ color: '#ffffff' }}
          >
            <Phone size={18} />
          </IconButton>
        </Tooltip>
        <Tooltip title={whatsappLabel}>
          <IconButton
            component="a"
            href={COMPANY_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            aria-label={whatsappLabel}
            sx={{ color: '#25D366' }}
          >
            <WhatsAppIcon size={18} />
          </IconButton>
        </Tooltip>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Button
        component="a"
        href={COMPANY_PHONE_TEL}
        size="small"
        sx={{
          ...actionButtonSx,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
        aria-label={callLabel}
      >
        <Phone size={16} />
        <Box component="span" sx={{ mt: 0.2 }}>{callLabel}</Box>
      </Button>
      <Button
        component="a"
        href={COMPANY_WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        size="small"
        sx={{
          ...actionButtonSx,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: '#128C7E',
          borderColor: alpha('#25D366', 0.35),
          '&:hover': {
            bgcolor: alpha('#25D366', 0.08),
            borderColor: '#25D366',
          },
        }}
        aria-label={whatsappLabel}
      >
        <WhatsAppIcon size={16} />
        <Box component="span" sx={{ mt: 0.2 }}>{whatsappLabel}</Box>
      </Button>
    </Box>
  )
}
