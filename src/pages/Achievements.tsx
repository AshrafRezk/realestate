import { Box, Container, Typography, Grid } from '@mui/material'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Award, Building2, Users, Trophy, ShieldCheck, Sparkles, Star, Quote, Home } from 'lucide-react'
import { useCountUp } from '../hooks/useCountUp'
import { DEMO_CONFIG } from '../lib/demo-config'

function StatCard({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const ref = useCountUp(value)
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography
        sx={{
          fontFamily: '"Hanken Grotesk", sans-serif',
          fontSize: { xs: 48, md: 56 },
          fontWeight: 500,
          color: '#0a1628',
          lineHeight: 1,
        }}
      >
        <span ref={ref}>0</span>
        <Typography
          component="span"
          sx={{
            fontFamily: '"Hanken Grotesk", sans-serif',
            fontSize: { xs: 28, md: 36 },
            fontWeight: 400,
            color: '#e6c364',
            ml: 0.5,
          }}
        >
          {suffix}
        </Typography>
      </Typography>
      <Typography
        sx={{
          fontFamily: '"Hanken Grotesk", sans-serif',
          fontSize: 12,
          letterSpacing: '0.1em',
          fontWeight: 600,
          color: '#c5c6cd',
          textTransform: 'uppercase',
          mt: 1.5,
        }}
      >
        {label}
      </Typography>
    </Box>
  )
}

export default function Achievements() {
  const { t, i18n } = useTranslation()

  const snapshotCards = [
    { icon: Home, title: t('ach.snapshot.cards.residential.title'), desc: t('ach.snapshot.cards.residential.desc') },
    { icon: Building2, title: t('ach.snapshot.cards.commercial.title'), desc: t('ach.snapshot.cards.commercial.desc') },
    { icon: Trophy, title: t('ach.snapshot.cards.investment.title'), desc: t('ach.snapshot.cards.investment.desc') },
    { icon: Users, title: t('ach.snapshot.cards.management.title'), desc: t('ach.snapshot.cards.management.desc') },
  ]

  const highlights = [
    { icon: Sparkles, title: t('ach.snapshot.highlights.legacy.title'), desc: t('ach.snapshot.highlights.legacy.desc') },
    { icon: ShieldCheck, title: t('ach.snapshot.highlights.quality.title'), desc: t('ach.snapshot.highlights.quality.desc') },
    { icon: Award, title: t('ach.snapshot.highlights.vision.title'), desc: t('ach.snapshot.highlights.vision.desc') },
  ]

  const awards = [
    { icon: Trophy, title: i18n.language.startsWith('ar') ? 'أفضل مطور عقاري' : 'Best Real Estate Developer', desc: i18n.language.startsWith('ar') ? 'جائزة العقارات السعودية 2023' : 'Saudi Real Estate Awards 2023' },
    { icon: ShieldCheck, title: i18n.language.startsWith('ar') ? 'شهادة ISO 9001' : 'ISO 9001 Certified', desc: i18n.language.startsWith('ar') ? 'نظام إدارة الجودة' : 'Quality Management Systems' },
    { icon: Sparkles, title: i18n.language.startsWith('ar') ? 'التميز في التصميم' : 'Design Excellence', desc: i18n.language.startsWith('ar') ? 'جائزة العمارة الخليجية 2022' : 'Gulf Architecture Award 2022' },
    { icon: Building2, title: i18n.language.startsWith('ar') ? 'الاستدامة الحضرية' : 'Urban Sustainability', desc: i18n.language.startsWith('ar') ? 'تقدير رؤية 2030' : 'Vision 2030 Recognition' },
    { icon: Users, title: i18n.language.startsWith('ar') ? 'خيار العملاء' : 'Customer Choice', desc: i18n.language.startsWith('ar') ? '5 سنوات متتالية' : '5 consecutive years' },
  ]

  const press = [
    { quote: i18n.language.startsWith('ar') ? 'أحد أبرز المطورين في المملكة، يجمع بين الجودة والابتكار.' : "One of the Kingdom's most distinguished developers, blending quality with innovation.", source: 'Arab News' },
    { quote: i18n.language.startsWith('ar') ? 'مرجع في بناء المجتمعات السكنية المتكاملة.' : 'A benchmark for building integrated residential communities.', source: 'Saudi Gazette' },
    { quote: i18n.language.startsWith('ar') ? 'التزامهم بمعايير الاستدامة يضع معيارًا جديدًا.' : 'Their commitment to sustainability sets a new standard.', source: 'Argaam' },
  ]

  return (
    <Box>
      {/* Hero */}
      <Box sx={{ bgcolor: '#0a1628', py: { xs: 5, md: 5 }, textAlign: 'center', position: 'relative', overflow: 'hidden', mb: 0 }}>
        <Container maxWidth="md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 3,
                py: 1,
                fontFamily: '"Hanken Grotesk", sans-serif',
                fontSize: 12,
                letterSpacing: '0.1em',
                fontWeight: 600,
                color: '#e6c364',
                textTransform: 'uppercase',
                mb: 3,
                mt: 0,
              }}
            >
              {i18n.language.startsWith('ar') ? 'إنجازاتنا' : 'Our Achievements'}
            </Box>
            <Typography
              variant="h1"
              sx={{ color: '#ffffff', mb: 2 }}
            >
              {t('ach.title')}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: 640, mx: 'auto', fontSize: 18, lineHeight: 1.7 }}
            >
              {t('ach.subtitle')}
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Stats Counters */}
      <Container maxWidth="lg" sx={{ mt: -2, pb: { xs: 6, md: 8 } }}>
        <Box
          sx={{
            bgcolor: '#ffffff',
            boxShadow: '0 20px 50px -20px rgba(10,22,40,0.25)',
            borderRadius: '12px',
            p: { xs: 4, md: 6 },
          }}
        >
          <Grid container spacing={{ xs: 4, md: 6 }}>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard value={35} suffix="+" label={t('ach.stats.years')} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard value={120} suffix="+" label={t('ach.stats.projects')} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard value={30000} suffix="+" label={t('ach.stats.units')} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <StatCard value={25000} suffix="+" label={t('ach.stats.families')} />
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Company Snapshot */}
      <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 12 } }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography
              sx={{
                fontFamily: '"Hanken Grotesk", sans-serif',
                fontSize: 12,
                letterSpacing: '0.1em',
                fontWeight: 600,
                color: '#e6c364',
                textTransform: 'uppercase',
                mb: 1.5,
              }}
            >
              {t('ach.snapshot.kicker')}
            </Typography>
            <Typography variant="h2" sx={{ mb: 2, color: '#abafd1' }}>
              {t('ach.snapshot.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640, mx: 'auto', fontSize: 17, lineHeight: 1.7 ,color: '#abafd1'}}>
              {t('ach.snapshot.subtitle', { companyName: DEMO_CONFIG.brand.name })}
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={{ xs: 3, md: 4 }}>
          {snapshotCards.map((card, i) => {
            const Icon = card.icon
            return (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                  <Box
                    sx={{
                      bgcolor: '#2a3546',
                      border: '1px solid rgba(10,22,40,0.06)',
                      borderRadius: '12px',
                      p: { xs: 4, md: 5 },
                      transition: 'all 0.4s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 20px 40px rgba(30,41,59,0.04)' },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        width: 56,
                        height: 56,
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#0a1628',
                        color: '#ffffff',
                        mb: 3,
                        transition: 'all 0.4s',
                        '&:hover': { bgcolor: '#e6c364', color: '#0a1628' },
                      }}
                    >
                      <Icon size={24} />
                    </Box>
                    <Typography variant="h4" sx={{ mb: 1.5 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {card.desc}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            )
          })}
        </Grid>

        {/* Highlights */}
        <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mt: 4 }}>
          {highlights.map((h, i) => {
            const Icon = h.icon
            return (
              <Grid size={{ xs: 12, md: 4 }} key={i}>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 3,
                      bgcolor: '#2a3546',
                      border: '1px solid rgba(10,22,40,0.06)',
                      p: { xs: 3, md: 4 },
                      transition: 'all 0.3s',
                      '&:hover': { boxShadow: '0 8px 24px rgba(30,41,59,0.04)' },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        width: 44,
                        height: 44,
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(230,195,100,0.1)',
                        color: '#e6c364',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={20} />
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ mb: 0.75 }}>
                        {h.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {h.desc}
                      </Typography>
                    </Box>
                  </Box>
                </motion.div>
              </Grid>
            )
          })}
        </Grid>
      </Container>

      {/* Awards */}
      <Box sx={{ bgcolor: '#0a1628', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 }, bgcolor: '#0a1628', borderRadius: '8px', p: { xs: 4, md: 6 } }}>
              <Typography
                sx={{
                  fontFamily: '"Hanken Grotesk", sans-serif',
                  fontSize: 12,
                  letterSpacing: '0.1em',
                  fontWeight: 600,
                  color: '#e6c364',
                  textTransform: 'uppercase',
                  mb: 1.5,
                }}
              >
                {t('ach.awards.title')}
              </Typography>
              <Typography variant="h2">
                {t('ach.awards.subtitle')}
              </Typography>
            </Box>
          </motion.div>

          <Grid container spacing={{ xs: 3, md: 4 }}>
            {awards.map((a, i) => {
              const Icon = a.icon
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}>
                    <Box
                      sx={{
                        bgcolor: '#2a3546',
                        border: '1px solid rgba(10,22,40,0.06)',
                        p: { xs: 4, md: 5 },
                        transition: 'all 0.4s',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 20px 40px rgba(30,41,59,0.04)' },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          width: 52,
                          height: 52,
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: '#0a1628',
                          color: '#ffffff',
                          mb: 3,
                          transition: 'all 0.4s',
                          '&:hover': { bgcolor: '#e6c364', color: '#0a1628' },
                        }}
                      >
                        <Icon size={22} />
                      </Box>
                      <Typography variant="h4" sx={{ mb: 1 }}>
                        {a.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {a.desc}
                      </Typography>
                    </Box>
                  </motion.div>
                </Grid>
              )
            })}
          </Grid>
        </Container>
      </Box>

      {/* Press */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <Typography variant="h2" sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            {t('ach.press.title')}
          </Typography>
        </motion.div>

        <Grid container spacing={{ xs: 3, md: 4 }}>
          {press.map((p, i) => (
            <Grid size={{ xs: 12, md: 4 }} key={i}>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <Box
                  sx={{
                    bgcolor: '#2a3546',
                    border: '1px solid rgba(10,22,40,0.06)',
                    p: { xs: 4, md: 5 },
                    transition: 'all 0.3s',
                    '&:hover': { boxShadow: '0 8px 24px rgba(30,41,59,0.04)' },
                  }}
                >
                  <Quote size={28} color="#e6c364" style={{ opacity: 0.6 }} />
                  <Typography
                    variant="body1"
                    sx={{ mt: 3, mb: 4, lineHeight: 1.7, fontStyle: 'italic', color: 'text.secondary' }}
                  >
                    {p.quote}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star key={k} size={16} color="#e6c364" fill="#e6c364" />
                    ))}
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: '"Hanken Grotesk", sans-serif',
                      fontSize: 12,
                      letterSpacing: '0.1em',
                      fontWeight: 600,
                      color: '#0a1628',
                      textTransform: 'uppercase',
                    }}
                  >
                    — {p.source}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}
