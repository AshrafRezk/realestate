import { Box, Button, Container, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { motion } from 'framer-motion'
import { Newspaper } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function OurNews() {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'transparent', pb: { xs: 6, md: 10 } }}>
      <Box
        sx={(theme) => ({
          bgcolor: alpha(theme.palette.primary.main, 0.85),
          backdropFilter: 'blur(20px)',
          color: 'common.white',
          py: { xs: 5, md: 7 },
          textAlign: 'center',
        })}
      >
        <Container maxWidth="lg">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                mb: 1.5,
                opacity: 0.9,
              }}
            >
              <Newspaper size={22} />
              <Typography variant="overline" sx={{ letterSpacing: '0.2em', fontWeight: 600 }}>
                {t('common.ourNews')}
              </Typography>
            </Box>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              {t('ourNewsPage.title')}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255,255,255,0.85)',
                maxWidth: '40rem',
                mx: 'auto',
                fontWeight: 400,
                fontSize: { xs: '1rem', md: '1.15rem' },
                lineHeight: 1.6,
              }}
            >
              {t('ourNewsPage.subtitle')}
            </Typography>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ pt: { xs: 4, md: 6 }, px: { xs: 2, md: 4 } }}>
        <Box
          sx={(theme) => ({
            textAlign: 'center',
            py: { xs: 6, md: 8 },
            px: { xs: 3, md: 5 },
            borderRadius: 3,
            bgcolor: alpha(theme.palette.background.paper, 0.75),
            backdropFilter: 'blur(16px)',
            border: `1px dashed ${alpha(theme.palette.divider, 0.4)}`,
            boxShadow: '0 8px 24px rgba(2, 6, 23, 0.06)',
          })}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              color: 'primary.main',
            }}
          >
            <Newspaper size={36} />
          </Box>
          <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
            {t('ourNewsPage.placeholder.title')}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 480, mx: 'auto', lineHeight: 1.8, mb: 1.5 }}
          >
            {t('ourNewsPage.placeholder.description')}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              maxWidth: 420,
              mx: 'auto',
              lineHeight: 1.7,
              fontStyle: 'italic',
              opacity: 0.9,
              textAlign: isRtl ? 'center' : 'center',
            }}
          >
            {t('ourNewsPage.placeholder.note')}
          </Typography>
          <Button component={Link} to="/contact" variant="contained" size="large" sx={{ mt: 4 }}>
            {t('ourNewsPage.contactCta')}
          </Button>
        </Box>
      </Container>
    </Box>
  )
}
