import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Phone, Mail, MapPin, Clock, Instagram, Linkedin } from 'lucide-react'
import { getOfficeMapUrl } from '../lib/api-client'
import LeadInterestForm from '../components/home/LeadInterestForm'
import { DEMO_CONFIG } from '../lib/demo-config'

// Custom X (Twitter) icon component
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

// Custom TikTok icon component
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

const salesOffices = DEMO_CONFIG.offices

export default function Contact() {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language.startsWith('ar')
  const [mapUrl, setMapUrl] = useState<string | null>(null)
  const [mapMetaKeywords, setMapMetaKeywords] = useState<string | undefined>(undefined)
  const [isLoadingMap, setIsLoadingMap] = useState(true)
  const [activeLocation, setActiveLocation] = useState<OfficeLocation>(salesOffices[0])

  const getEmbedUrl = () => {
    return `https://maps.google.com/maps?q=${activeLocation.coords}&t=&z=15&ie=UTF8&iwloc=&output=embed`
  }

  useEffect(() => {
    const fetchMapUrl = async () => {
      setIsLoadingMap(true)
      try {
        const result = await getOfficeMapUrl()
        setMapUrl(result.mapUrl)
        setMapMetaKeywords(result.metaKeywords)
      } catch (error) {
        console.error('Failed to fetch office map URL:', error)
      } finally {
        setIsLoadingMap(false)
      }
    }
    fetchMapUrl()
  }, [])

  useEffect(() => {
    const handleHashScroll = () => {
      if (window.location.hash === '#locations') {
        setTimeout(() => {
          const element = document.getElementById('locations')
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 300)
      }
    }
    handleHashScroll()
    window.addEventListener('hashchange', handleHashScroll)
    return () => window.removeEventListener('hashchange', handleHashScroll)
  }, [])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'transparent' }}>
      {/* Header */}
      <Box sx={(theme) => ({ bgcolor: alpha(theme.palette.primary.main, 0.8), backdropFilter: 'blur(20px)', color: 'white', px: { xs: 2, md: 3 }, py: 6, textAlign: 'center' })}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              {t('contact.title')}
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', maxWidth: '42rem', mx: 'auto' }}>
              {t('contact.description')}
            </Typography>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Message form */}
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card
                sx={(theme) => ({
                  backgroundColor: alpha(theme.palette.background.paper, 0.6),
                  backdropFilter: 'blur(16px)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
                })}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="semibold" gutterBottom>
                    {t('contact.formTitle')}
                  </Typography>
                  <LeadInterestForm mode="inline" active />
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Contact Info */}
          <Grid size={{ xs: 12, md: 6 }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="semibold" gutterBottom>
                  {t('contact.contactInfo')}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    {
                      icon: Phone,
                      label: t('contact.phoneLabel'),
                      value: DEMO_CONFIG.contact.phoneDisplay,
                      href: DEMO_CONFIG.contact.phoneTel,
                    },
                    {
                      icon: Mail,
                      label: t('contact.emailLabel'),
                      value: `${DEMO_CONFIG.contact.email} / ${DEMO_CONFIG.contact.supportEmail}`,
                      href: `mailto:${DEMO_CONFIG.contact.email}`,
                    },
                    {
                      icon: MapPin,
                      label: t('contact.addressLabel'),
                      value: t('contact.address', { address: isRtl ? DEMO_CONFIG.location.addressAr : DEMO_CONFIG.location.addressEn }),
                    },
                    {
                      icon: Clock,
                      label: t('contact.workingHours'),
                      value: t('contact.workingHoursValue'),
                    },
                  ].map((item) => {
                    const Icon = item.icon
                    const content = (
                      <Card
                        sx={(theme) => ({
                          backgroundColor: alpha(theme.palette.background.paper, 0.6),
                          backdropFilter: 'blur(16px)',
                          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
                        })}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: 'primary.main',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <Icon size={20} color="white" />
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {item.label}
                              </Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {item.value}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    )

                    return item.href ? (
                      <Box
                        key={item.label}
                        component="a"
                        href={item.href}
                        sx={{ textDecoration: 'none', '&:hover': { opacity: 0.8 } }}
                      >
                        {content}
                      </Box>
                    ) : (
                      <Box key={item.label}>{content}</Box>
                    )
                  })}
                </Box>
              </Box>

              {/* Social Links */}
              <Box>
                <Typography variant="h6" fontWeight="semibold" gutterBottom>
                  {t('contact.followUs')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {[
                    {
                      icon: Instagram,
                      href: DEMO_CONFIG.social.instagram,
                      label: t('share.instagram'),
                      color: '#E4405F'
                    },
                    {
                      icon: XIcon,
                      href: DEMO_CONFIG.social.twitter,
                      label: t('share.twitter'),
                      color: '#000000'
                    },
                    {
                      icon: Linkedin,
                      href: DEMO_CONFIG.social.linkedin,
                      label: t('share.linkedin'),
                      color: '#0077B5'
                    },
                    {
                      icon: WhatsAppIcon,
                      href: DEMO_CONFIG.contact.whatsappUrl,
                      label: t('share.whatsapp'),
                      color: '#25D366'
                    },
                    {
                      icon: TikTokIcon,
                      href: DEMO_CONFIG.social.tiktok,
                      label: t('share.tiktok'),
                      color: '#000000'
                    },
                  ].map((social) => {
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
                            }
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
            </motion.div>
          </Grid>
        </Grid>

        {/* HQ Map & Sales Offices Locations Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Box id="locations" sx={{ mt: 6 }}>
            <Grid container spacing={4}>
              {/* HQ Map Card */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card
                  sx={(theme) => ({
                    backgroundColor: alpha(theme.palette.background.paper, 0.6),
                    backdropFilter: 'blur(16px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'hidden',
                  })}
                >
                  <Box sx={{ p: 2.5, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="primary.main">
                        {isRtl ? activeLocation.project : activeLocation.projectEn}
                      </Typography>
                      {activeLocation.isHq && (
                        <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 600, display: 'block', mt: 0.5 }}>
                          {isRtl ? 'الإدارة العامة' : 'General Administration'}
                        </Typography>
                      )}
                    </Box>
                    <MapPin size={20} color="#1a365d" />
                  </Box>
                  <Box sx={{ flexGrow: 1, minHeight: 400, position: 'relative', bgcolor: 'grey.50' }}>
                    {isLoadingMap && activeLocation.isHq ? (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Box sx={{ textAlign: 'center' }}>
                          <MapPin size={32} color="#718096" style={{ margin: '0 auto 8px', display: 'block' }} />
                          <Typography variant="caption" color="text.secondary">
                            {isRtl ? 'جاري التحميل...' : 'Loading...'}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <iframe
                        src={getEmbedUrl()}
                        width="100%"
                        height="100%"
                        style={{ border: 0, display: 'block', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={mapMetaKeywords || t('contact.mapTitle')}
                      />
                    )}
                  </Box>
                  <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center', bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                    <Box
                      component="a"
                      href={activeLocation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        textDecoration: 'none',
                        color: 'secondary.main',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        '&:hover': {
                          textDecoration: 'underline',
                          opacity: 0.8
                        }
                      }}
                    >
                      <MapPin size={16} />
                      <span>{isRtl ? 'فتح في خرائط جوجل للحصول على الاتجاهات ←' : 'Open in Google Maps for directions ←'}</span>
                    </Box>
                  </Box>
                </Card>
              </Grid>

              {/* Sales Offices Location Card */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Card
                  sx={(theme) => ({
                    backgroundColor: alpha(theme.palette.background.paper, 0.6),
                    backdropFilter: 'blur(16px)',
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
                    height: '100%',
                    borderRadius: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  })}
                >
                  <Box sx={{ p: 2.5, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                      {isRtl ? 'مواقع فروع ومكاتب المبيعات' : 'Office & Sales Branch Locations'}
                    </Typography>
                    <MapPin size={20} className="text-secondary-main" />
                  </Box>
                  <Box sx={{ flexGrow: 1, maxHeight: 440, overflowY: 'auto' }}>
                    {salesOffices.map((office, idx) => {
                      const isActive = activeLocation.coords === office.coords
                      return (
                        <Box
                          key={idx}
                          onClick={() => {
                            setActiveLocation(office)
                          }}
                          sx={(theme) => ({
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 3,
                            py: 2.2,
                            borderBottom: idx === salesOffices.length - 1 ? 0 : 1,
                            borderColor: 'divider',
                            cursor: 'pointer',
                            color: 'text.primary',
                            borderRight: isRtl && isActive ? '4px solid' : 'none',
                            borderLeft: !isRtl && isActive ? '4px solid' : 'none',
                            borderRightColor: 'secondary.main',
                            borderLeftColor: 'secondary.main',
                            bgcolor: isActive
                              ? alpha(theme.palette.secondary.main, 0.08)
                              : idx % 2 === 0
                              ? 'transparent'
                              : 'rgba(0,0,0,0.01)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: isActive
                                ? alpha(theme.palette.secondary.main, 0.12)
                                : 'rgba(201, 162, 39, 0.06)',
                              '& .project-name': {
                                color: 'secondary.main',
                                transform: isRtl ? 'translateX(-4px)' : 'translateX(4px)',
                              },
                            },
                          })}
                        >
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography
                              className="project-name"
                              fontWeight={isActive ? 700 : 600}
                              sx={{
                                fontSize: '0.95rem',
                                color: isActive ? 'secondary.main' : 'text.primary',
                                transition: 'all 0.2s ease-in-out',
                              }}
                            >
                              {isRtl ? office.project : office.projectEn}
                            </Typography>
                            {office.isHq && (
                              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                {isRtl ? 'المقر الرئيسي للمجموعة' : 'Company Headquarters'}
                              </Typography>
                            )}
                          </Box>
                          <Box
                            component="a"
                            href={office.dirUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              color: isActive ? 'secondary.main' : 'text.secondary',
                              fontWeight: 600,
                              fontSize: '0.82rem',
                              textDecoration: 'none',
                              border: '1px solid',
                              borderColor: isActive ? 'secondary.main' : 'divider',
                              borderRadius: 1,
                              px: 1.5,
                              py: 0.6,
                              bgcolor: isActive ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                bgcolor: 'secondary.main',
                                color: 'white',
                                borderColor: 'secondary.main',
                              },
                            }}
                          >
                            <span>
                              {isRtl ? 'الاتجاهات ←' : 'Directions ←'}
                            </span>
                          </Box>
                        </Box>
                      )
                    })}
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </motion.div>
      </Container>
    </Box>
  )
}

