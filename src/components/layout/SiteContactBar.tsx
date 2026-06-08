import { Box, Container, IconButton, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { Mail, MapPin, Instagram, Linkedin, Facebook, Phone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { DEMO_CONFIG } from '../../lib/demo-config'

const XIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const TikTokIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
)

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.04 2C6.55 2 2.08 6.47 2.08 11.96c0 1.77.46 3.5 1.33 5.02L2 22l5.15-1.35a9.9 9.9 0 0 0 4.89 1.25h.01c5.49 0 9.96-4.47 9.96-9.96C22.01 6.47 17.54 2 12.04 2Zm0 17.99h-.01a8.3 8.3 0 0 1-4.22-1.16l-.3-.18-3.06.8.82-2.98-.2-.31a8.26 8.26 0 0 1-1.26-4.4c0-4.58 3.73-8.3 8.31-8.3 4.58 0 8.31 3.72 8.31 8.3 0 4.58-3.73 8.3-8.39 8.3Zm4.82-6.2c-.26-.13-1.53-.75-1.77-.84-.24-.09-.41-.13-.58.13-.17.26-.67.84-.82 1.01-.15.17-.3.2-.56.07-.26-.13-1.08-.4-2.06-1.27-.76-.68-1.27-1.52-1.42-1.78-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.58-1.39-.79-1.9-.21-.5-.43-.43-.58-.44h-.5c-.17 0-.45.06-.69.32-.24.26-.9.88-.9 2.15 0 1.27.92 2.5 1.05 2.68.13.17 1.81 2.76 4.38 3.87.61.26 1.08.42 1.45.54.61.19 1.16.16 1.6.1.49-.07 1.53-.62 1.75-1.22.22-.6.22-1.12.15-1.22-.06-.1-.23-.16-.49-.29Z" />
  </svg>
)

export default function SiteContactBar() {
  const { t, i18n } = useTranslation()

  const socialLinks = [
    {
      icon: Instagram,
      href: 'https://www.instagram.com/cloudastick/',
      label: t('share.instagram'),
      color: '#E4405F',
    },
    {
      icon: XIcon,
      href: 'https://x.com/cloudastick',
      label: t('share.twitter'),
      color: '#000000',
    },
    {
      icon: Linkedin,
      href: 'https://www.linkedin.com/company/cloudastick/',
      label: t('share.linkedin'),
      color: '#0077B5',
    },
    {
      icon: WhatsAppIcon,
      href: 'https://wa.me/201005298308',
      label: t('share.whatsapp'),
      color: '#25D366',
    },
    {
      icon: Facebook,
      href: 'https://www.facebook.com/cloudastick',
      label: t('share.facebook'),
      color: '#1877F2',
    },
    {
      icon: TikTokIcon,
      href: 'https://www.tiktok.com/@cloudastick?_r=1&_t=ZS-96vTh4SGSuI',
      label: t('share.tiktok'),
      color: '#000000',
    },
  ]

  return (
    <Box
      component="aside"
      aria-label={t('siteContactBar.label')}
      sx={{ py: 6, px: { xs: 2, md: 3 }, borderTop: 1, borderColor: 'divider', bgcolor: 'background.default' }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 4 }}>
          <Box
            component="a"
            href={DEMO_CONFIG.contact.phoneTel}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              color: 'text.secondary',
              textDecoration: 'none',
              '&:hover': { color: 'primary.main' },
            }}
          >
            <Phone size={20} />
            <Typography variant="body2" dir="ltr">
              {t('home.phone', { phone: DEMO_CONFIG.contact.phoneDisplay })}
            </Typography>
          </Box>
          <Box
            component="a"
            href={`mailto:${DEMO_CONFIG.contact.email}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              color: 'text.secondary',
              textDecoration: 'none',
              '&:hover': { color: 'primary.main' },
            }}
          >
            <Mail size={20} />
            <Typography variant="body2">{t('home.email', { email: DEMO_CONFIG.contact.emailDisplay })}</Typography>
          </Box>
          <Box
            component={RouterLink}
            to="/contact#locations"
            onClick={(e) => {
              if (window.location.pathname === '/contact') {
                e.preventDefault()
                const element = document.getElementById('locations')
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  window.history.pushState(null, '', '#locations')
                }
              }
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              color: 'text.secondary',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: 'primary.main',
                '& svg': {
                  color: 'secondary.main',
                  transform: 'translateY(-2px)'
                }
              }
            }}
          >
            <MapPin size={20} style={{ transition: 'all 0.2s ease' }} />
            <Typography variant="body2">{t('home.address', { address: i18n.language.startsWith('ar') ? DEMO_CONFIG.location.addressAr : DEMO_CONFIG.location.addressEn })}</Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {socialLinks.map((social) => {
              const Icon = social.icon
              return (
                <IconButton
                  key={social.label}
                  component="a"
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      borderColor: social.color || 'primary.main',
                      '& svg': {
                        color: social.color || 'primary.main',
                      },
                    },
                  }}
                  aria-label={social.label}
                  title={social.label}
                >
                  <Icon size={20} />
                </IconButton>
              )
            })}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
