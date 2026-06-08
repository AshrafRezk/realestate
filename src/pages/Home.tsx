import { useState, useEffect } from 'react'
import { Box, Container, Typography, Button } from '@mui/material'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import HeroSection from '../components/home/HeroSection'
import FeaturedListings from '../components/home/FeaturedListings'
import InspiringSpacesSection from '../components/home/InspiringSpacesSection'
import StatsSection from '../components/home/StatsSection'
import OurFieldsSection from '../components/home/OurFieldsSection'
import AboutProjectsSection from '../components/home/AboutProjectsSection'
import RegisterInterestModal from '../components/home/RegisterInterestModal'
import MorphicBackground from '../components/home/MorphicBackground'

export default function Home() {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const { t, i18n } = useTranslation()

  useEffect(() => {
    // Update HTML lang and dir attributes when language changes
    document.documentElement.lang = i18n.language
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
  }, [i18n.language])

  return (
    <Box sx={{ position: 'relative', overflowX: 'hidden' }}>
      <MorphicBackground />
      <HeroSection />
      <FeaturedListings />
      <InspiringSpacesSection />
      <StatsSection />
      <OurFieldsSection />
      <AboutProjectsSection />

      {/* CTA Section */}
      <Box sx={(theme) => ({ py: 8, px: { xs: 2, md: 3 }, bgcolor: theme.palette.primary.main, color: 'white' })}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              {t('home.ctaTitle')}
            </Typography>
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 4, maxWidth: '42rem', mx: 'auto' }}>
              {t('home.ctaDescription')}
            </Typography>
            <Button
              variant="outlined"
              size="large"
              onClick={() => setIsRegisterModalOpen(true)}
              sx={{
                px: { xs: 2.25, sm: 2.75 },
                py: { xs: 1, sm: 1.125 },
                gap: 0.5,
                borderRadius: 1.5,
                borderWidth: 1.5,
                fontWeight: 500,
                borderColor: 'rgba(255, 255, 255, 0.75)',
                color: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.06)',
                '&:hover': {
                  borderWidth: 1.5,
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.12)',
                },
              }}
            >
              {t('home.registerInterest')}
            </Button>
          </motion.div>
        </Container>
      </Box>

      {/* Register Interest Modal */}
      <RegisterInterestModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </Box>
  )
}

