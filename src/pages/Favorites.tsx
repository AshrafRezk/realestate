import { useEffect, useState } from 'react'
import { Box, Container, Typography, Button, CircularProgress } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useFavoritesStore } from '../lib/store/favorites-store'
import { getUnit } from '../lib/api-client'
import { Unit } from '../lib/types'
import FavoriteButton from '../components/ui/FavoriteButton'
import LazyImage from '../components/ui/LazyImage'
import CurrencyIcon from '../components/ui/CurrencyIcon'
import { PLACEHOLDER_UNIT_IMAGE } from '../lib/placeholderImages'

export default function Favorites() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { favoriteUnitIds, removeFavorite } = useFavoritesStore()
  const [units, setUnits] = useState<(Unit & { id: string })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFavorites() {
      if (favoriteUnitIds.length === 0) {
        setLoading(false)
        return
      }
      try {
        const results = await Promise.allSettled(
          favoriteUnitIds.map((id) => getUnit(id))
        )
        const loaded: (Unit & { id: string })[] = []
        results.forEach((result) => {
          if (result.status === 'fulfilled' && result.value.success && result.value.data) {
            loaded.push(result.value.data.unit)
          }
        })
        setUnits(loaded)
      } catch (err) {
        console.error('Error loading favorites:', err)
      } finally {
        setLoading(false)
      }
    }
    loadFavorites()
  }, [favoriteUnitIds])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 20, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#071423' }}>
      {/* Top Bar */}
      <Box sx={{ bgcolor: '#2a3546', borderBottom: '1px solid rgba(0,53,39,0.1)' }}>
        <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
          <Button
            onClick={() => navigate(-1)}
            sx={{ color: '#0a1628', fontFamily: '"Hanken Grotesk", sans-serif', fontSize: 12, letterSpacing: '0.1em', fontWeight: 600 }}
          >
            ← {i18n.language === 'ar' ? 'رجوع' : 'BACK'}
          </Button>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pt: { xs: 6, md: 10 }, pb: 16 }}>
        {/* Page Header */}
        <Box sx={{ mb: { xs: 6, md: 10 } }}>
          <Typography variant="h2" sx={{ mb: 1 }}>
            {i18n.language === 'ar' ? 'العقارات المحفوظة' : 'Saved Properties'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560 }}>
            {i18n.language === 'ar'
              ? 'مجموعة مختارة من أرقى العقارات التي تهمك'
              : 'A curated collection of your most desired architectural masterpieces.'}
          </Typography>
        </Box>

        {units.length === 0 ? (
          /* Empty State */
          <Box sx={{ py: 16, textAlign: 'center' }}>
            <Typography sx={{ fontFamily: '"Hanken Grotesk", sans-serif', color: '#45474c', fontSize: 64, mb: 4 }}>
              favorite_border
            </Typography>
            <Typography variant="h4" sx={{ mb: 1 }}>
              {i18n.language === 'ar' ? 'لا توجد عقارات محفوظة بعد' : 'No saved properties yet'}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 6 }}>
              {i18n.language === 'ar'
                ? 'ابدأ رحلتك في استكشاف مجموعتنا الحصرية'
                : 'Begin your journey through our exclusive catalog.'}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/search')}
              sx={{
                bgcolor: '#0a1628',
                color: '#ffffff',
                px: 8,
                py: 2,
                fontFamily: '"Hanken Grotesk", sans-serif',
                fontSize: 12,
                letterSpacing: '0.1em',
                fontWeight: 600,
                '&:hover': { bgcolor: '#1f2b3b' },
              }}
            >
              {i18n.language === 'ar' ? 'استكشاف العقارات' : 'EXPLORE LISTINGS'}
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {units.map((unit, index) => (
              <motion.div
                key={unit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    bgcolor: '#2a3546',
                    border: '1px solid rgba(0,53,39,0.06)',
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 20px 40px rgba(30,41,59,0.04)' },
                  }}
                >
                  <Box
                    onClick={() => navigate(`/unit/${unit.id}`)}
                    sx={{ width: { xs: '100%', md: 320 }, height: { xs: 256, md: 'auto' }, flexShrink: 0, overflow: 'hidden', cursor: 'pointer' }}
                  >
                    <LazyImage
                      src={unit.images?.[0] || PLACEHOLDER_UNIT_IMAGE}
                      alt={`Unit ${unit.unitNumber}`}
                      objectFit="cover"
                      sx={{ width: '100%', height: '100%' }}
                    />
                  </Box>
                  <Box sx={{ flex: 1, p: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography sx={{ fontFamily: '"Hanken Grotesk", sans-serif', fontSize: 12, letterSpacing: '0.1em', fontWeight: 600, color: '#0a1628', mb: 1, textTransform: 'uppercase' }}>
                            {unit.projectName || 'Luxury Property'}
                          </Typography>
                          <Typography variant="h4" sx={{ mb: 0.5 }}>
                            {i18n.language.startsWith('ar') ? unit.projectNameAr || `Unit ${unit.unitNumber}` : unit.projectName || `Unit ${unit.unitNumber}`}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {unit.phaseName || ''}
                          </Typography>
                        </Box>
                        <Box
                          onClick={() => removeFavorite(unit.id)}
                          sx={{
                            p: 1,
                            color: '#c5c6cd',
                            cursor: 'pointer',
                            opacity: { xs: 1, md: 0 },
                            transition: 'opacity 0.3s',
                            '&:hover': { color: '#ffb4ab' },
                            '.MuiCard-root:hover &, &:hover': { opacity: 1 },
                          }}
                          title="Remove from saved"
                        >
                          <Typography sx={{ fontFamily: '"Hanken Grotesk", sans-serif' }}>close</Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ mt: { xs: 3, md: 4 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'flex-end' }, justifyContent: 'space-between', gap: 3 }}>
                      <Box sx={{ display: 'flex', gap: { xs: 4, md: 6 } }}>
                        <Box>
                          <Typography sx={{ fontFamily: '"Hanken Grotesk", sans-serif', fontSize: 12, letterSpacing: '0.1em', fontWeight: 600, color: '#c5c6cd', textTransform: 'uppercase', mb: 0.5 }}>
                            {i18n.language === 'ar' ? 'المساحة' : 'Area'}
                          </Typography>
                          <Typography variant="h6">
                            {unit.area ? `${Math.round(unit.area).toLocaleString()} SQ FT` : '—'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontFamily: '"Hanken Grotesk", sans-serif', fontSize: 12, letterSpacing: '0.1em', fontWeight: 600, color: '#c5c6cd', textTransform: 'uppercase', mb: 0.5 }}>
                            {i18n.language === 'ar' ? 'الغرف' : 'Rooms'}
                          </Typography>
                          <Typography variant="h6">
                            {unit.bedrooms || '—'} Bed {unit.bathrooms ? `/ ${unit.bathrooms} Bath` : ''}
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography sx={{ fontFamily: '"Hanken Grotesk", sans-serif', fontSize: 12, letterSpacing: '0.1em', fontWeight: 600, color: '#0a1628', textTransform: 'uppercase', mb: 0.5 }}>
                          {i18n.language === 'ar' ? 'السعر' : 'Offered At'}
                        </Typography>
                        <Typography variant="h4" sx={{ color: '#0a1628' }}>
                          <CurrencyIcon theme="light" />{formatPrice(unit.price)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  )
}
