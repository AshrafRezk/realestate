import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AppBar, Toolbar, Box, Button, IconButton, Menu, MenuItem } from '@mui/material'
import { LogOut, MessageSquare, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../lib/store'
import { logout } from '../../lib/api-client'
import BrandLogo from './BrandLogo'
import NavContactActions from './NavContactActions'
import ContactUsFormModal from './ContactUsFormModal'

/** True when this nav item should show as the current page (nested routes included; home is exact). */
function isNavPathActive(pathname: string, itemPath: string): boolean {
  if (itemPath === '/') return pathname === '/'
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`)
}

export default function Header() {
  const location = useLocation()
  const { user, clearAuth } = useAuthStore()
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const [contactFormOpen, setContactFormOpen] = useState(false)
  const [moreMenuAnchor, setMoreMenuAnchor] = useState<null | HTMLElement>(null)

  const mainNavItems = [
    { path: '/', label: t('common.home') },
    { path: '/about-us', label: t('common.aboutUs') },
    { path: '/achievements', label: t('common.achievements') },
    { path: '/search', label: t('common.properties', 'Properties') },
    { path: '/news', label: t('common.ourNews') },
  ]

  const moreNavItems = [
    { path: '/latest-releases', label: t('common.latestReleases', 'Latest Releases') },
    { path: '/community', label: t('common.community') },
    { path: '/contact', label: t('common.support', 'Support') },
  ]

  return (
    <AppBar
      position="absolute"
      elevation={0}
      sx={{
        backgroundColor: 'rgba(0,53,39,0.5)',
        backdropFilter: 'blur(12px)',
        boxShadow: 'none',
      }}
      className="safe-top"
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px !important', px: { xs: 1, md: 2, lg: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <BrandLogo variant="header" />
          </Link>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: { md: 2, lg: 4 }, flexGrow: 1, mx: { md: 2, lg: 4 } }}>
          {mainNavItems.map((item) => {
            const active = isNavPathActive(location.pathname, item.path)
            return (
              <Box
                key={item.path}
                component={Link}
                to={item.path}
                sx={{
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  position: 'relative',
                  whiteSpace: 'nowrap',
                  '&:after': active ? {
                    content: '""',
                    position: 'absolute',
                    bottom: -4,
                    left: 0,
                    width: '100%',
                    height: 2,
                    bgcolor: '#ffffff',
                  } : {},
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              >
                {item.label}
              </Box>
            )
          })}

          <Box
            onClick={(e) => setMoreMenuAnchor(e.currentTarget)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              '&:hover': { opacity: 0.8 },
            }}
          >
            {t('common.more', 'More')} <ChevronDown size={16} />
          </Box>
          <Menu
            anchorEl={moreMenuAnchor}
            open={Boolean(moreMenuAnchor)}
            onClose={() => setMoreMenuAnchor(null)}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 150,
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }
            }}
          >
            {moreNavItems.map((item) => (
              <MenuItem
                key={item.path}
                component={Link}
                to={item.path}
                onClick={() => setMoreMenuAnchor(null)}
                sx={{
                  color: '#191c1e',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  py: 1.5,
                  ...(isNavPathActive(location.pathname, item.path) && {
                    bgcolor: 'rgba(0,53,39,0.06)',
                    fontWeight: 700,
                  })
                }}
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>

          <Box sx={{ flexGrow: 1 }} />

          <Button
            variant="outlined"
            size="small"
            onClick={() => setContactFormOpen(true)}
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.75,
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              borderColor: 'rgba(255,255,255,0.5)',
              color: '#ffffff',
              whiteSpace: 'nowrap',
              '&:hover': {
                borderColor: '#ffffff',
                bgcolor: 'rgba(255,255,255,0.1)',
              },
            }}
          >
            <MessageSquare size={16} />
            <Box component="span" sx={{ mt: 0.2 }}>{t('common.contact')}</Box>
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: { xs: 'flex', lg: 'none' } }}>
              <NavContactActions compact />
            </Box>
            <Box sx={{ display: { xs: 'none', lg: 'flex' } }}>
              <NavContactActions />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#ffffff', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => i18n.changeLanguage(isRtl ? 'en' : 'ar')}>
            <Box component="span" sx={{ textDecoration: isRtl ? 'underline' : 'none' }}>AR</Box>
            <span>/</span>
            <Box component="span" sx={{ textDecoration: !isRtl ? 'underline' : 'none' }}>EN</Box>
          </Box>
          {user && (
            <IconButton
              onClick={async () => {
                try {
                  await logout()
                } finally {
                  clearAuth()
                }
              }}
              size="small"
              title={t('common.logout')}
              sx={{ color: '#ffffff' }}
            >
              <LogOut size={18} />
            </IconButton>
          )}
        </Box>

        {/* Mobile right-side actions (outside glass container) */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={() => setContactFormOpen(true)}
            aria-label={t('common.contact')}
            sx={{ color: '#ffffff' }}
          >
            <MessageSquare size={20} />
          </IconButton>
          <Box sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }} onClick={() => i18n.changeLanguage(isRtl ? 'en' : 'ar')}>
            {isRtl ? 'EN' : 'AR'}
          </Box>
        </Box>
      </Toolbar>

      <ContactUsFormModal open={contactFormOpen} onClose={() => setContactFormOpen(false)} />
    </AppBar>
  )
}

