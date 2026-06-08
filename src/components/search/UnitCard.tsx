import { Link } from 'react-router-dom'
import { Card, Chip, Box, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Unit } from '../../lib/types'
import FavoriteButton from '../ui/FavoriteButton'
import LazyImage from '../ui/LazyImage'
import SubsidyBadges from '../units/SubsidyBadges'
import CurrencyIcon from '../ui/CurrencyIcon'
import { PLACEHOLDER_UNIT_IMAGE } from '../../lib/placeholderImages'

interface UnitCardProps {
  unit: Unit
  index?: number
  variant?: 'grid' | 'list'
}

export default function UnitCard({ unit, index = 0, variant = 'grid' }: UnitCardProps) {
  const { t, i18n } = useTranslation()
  const isList = variant === 'list'

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const statusColors: Record<Unit['status'], 'success' | 'warning' | 'error'> = {
    Available: 'success',
    Reserved: 'warning',
    Sold: 'error',
  }

  const statusLabels: Record<Unit['status'], string> = {
    Available: t('unit.available'),
    Reserved: t('unit.reserved'),
    Sold: t('unit.sold'),
  }

  if (isList) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Card
          component={Link}
          to={`/unit/${unit.id}`}
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            textDecoration: 'none',
            borderRadius: { xs: 3, md: 4 },
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' },
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
        >
          <Box sx={{ position: 'relative', width: { xs: '100%', sm: 220 }, height: { xs: 140, sm: 160 }, flexShrink: 0, overflow: 'hidden' }}>
            <LazyImage
              src={unit.images?.[0] || PLACEHOLDER_UNIT_IMAGE}
              alt={`Unit ${unit.unitNumber}`}
              objectFit="cover"
              sx={{ height: '100%' }}
            />
            <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
              <FavoriteButton unitId={unit.id} size="small" />
            </Box>
          </Box>
          <Box sx={{ flex: 1, p: { xs: 2, sm: 2.5 } }}>
            <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {formatPrice(unit.price)} <CurrencyIcon theme="light" className="mx-1" />
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {i18n.language.startsWith('ar') ? unit.projectNameAr : unit.projectName} • {i18n.language.startsWith('ar') ? unit.phaseNameAr : unit.phaseName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.75rem', color: 'text.secondary', mt: 'auto' }}>
              <Typography variant="caption">{unit.bedrooms} {t('unit.bedrooms')}</Typography>
              {unit.bathrooms && <Typography variant="caption">{unit.bathrooms} {t('unit.bathrooms')}</Typography>}
              <Typography variant="caption">{unit.area} {t('unit.areaUnit')}</Typography>
            </Box>
          </Box>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        component={Link}
        to={`/unit/${unit.id}`}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          textDecoration: 'none',
          bgcolor: '#ffffff',
          borderRadius: { xs: 3, md: 4 },
          boxShadow: '0 20px 40px rgba(30,41,59,0.04)',
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 24px 48px rgba(30,41,59,0.08)' },
        }}
      >
        <Box sx={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden' }}>
          <LazyImage
            src={unit.images?.[0] || PLACEHOLDER_UNIT_IMAGE}
            alt={`Unit ${unit.unitNumber}`}
            objectFit="cover"
            sx={{
              width: '100%',
              height: '100%',
              transition: 'transform 0.7s',
              '.MuiCard-root:hover &': { transform: 'scale(1.05)' },
            }}
          />
          <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 2 }}>
            <SubsidyBadges eligible={unit.eligibleForSubsidies} size="large" />
          </Box>
          <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
            <FavoriteButton unitId={unit.id} size="small" />
          </Box>
          {unit.status === 'Available' && (
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                bgcolor: '#ffffff',
                px: 2,
                py: 0.5,
                fontFamily: '"Inter", sans-serif',
                fontSize: 10,
                letterSpacing: '0.1em',
                fontWeight: 600,
                color: '#191c1e',
              }}
            >
              FEATURED
            </Box>
          )}
          {unit.status !== 'Available' && (
            <Chip
              label={statusLabels[unit.status]}
              color={statusColors[unit.status]}
              size="small"
              sx={{ position: 'absolute', bottom: 12, left: 12, zIndex: 2 }}
            />
          )}
        </Box>
        <Box sx={{ p: { xs: 4, md: 5 } }}>
          <Typography
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontSize: 12,
              letterSpacing: '0.1em',
              fontWeight: 600,
              color: '#003527',
              mb: 1,
              textTransform: 'uppercase',
            }}
          >
            {unit.projectName || 'Luxury Property'} {unit.phaseName ? `• ${unit.phaseName}` : ''}
          </Typography>
          <Typography
            variant="h4"
            sx={{ mb: 2 }}
          >
            {i18n.language.startsWith('ar') ? unit.projectNameAr || `Unit ${unit.unitNumber}` : unit.projectName || `Unit ${unit.unitNumber}`}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 2,
              borderTop: '1px solid rgba(0,53,39,0.12)',
              borderBottom: '1px solid rgba(0,53,39,0.12)',
              mb: 3,
            }}
          >
            <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: 12, letterSpacing: '0.1em', fontWeight: 600, color: '#5b677b' }}>
              {unit.bedrooms} BEDS
            </Typography>
            <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: 12, letterSpacing: '0.1em', fontWeight: 600, color: '#5b677b' }}>
              {unit.area ? `${Math.round(unit.area).toLocaleString()} SQFT` : '—'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" sx={{ color: '#003527', fontFamily: '"Playfair Display", serif', fontWeight: 500 }}>
              <CurrencyIcon theme="light" />{formatPrice(unit.price)}
            </Typography>
            <Typography sx={{ color: '#003527', fontSize: 24, transition: 'transform 0.3s', '.MuiCard-root:hover &': { transform: 'translateX(4px)' } }}>
              →
            </Typography>
          </Box>
        </Box>
      </Card>
    </motion.div>
  )
}
