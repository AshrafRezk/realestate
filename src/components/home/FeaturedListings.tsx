import { useState, useEffect } from 'react'
import { Box, Typography, Button, Container } from '@mui/material'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { searchUnits } from '../../lib/api-client'
import type { Unit } from '../../lib/types'

function formatPrice(price: number): string {
  if (price >= 1_000_000) {
    return `EGP ${(price / 1_000_000).toFixed(price % 1_000_000 === 0 ? 0 : 1)}M`
  }
  if (price >= 1_000) {
    return `EGP ${(price / 1_000).toFixed(0)}K`
  }
  return `EGP ${price.toLocaleString()}`
}

export default function FeaturedListings() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      try {
        const result = await searchUnits({ pageSize: 3, page: 1 })
        if (result.success && result.data) {
          setUnits(result.data.slice(0, 3))
        }
      } catch (err) {
        console.error('Failed to load featured listings:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <Box sx={{ bgcolor: '#0a1628', py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: { xs: 6, md: 8 } }}>
          <Typography variant="h2">
            Featured Listings
          </Typography>
          <Button
            onClick={() => navigate('/search')}
            sx={{
              fontFamily: '"Hanken Grotesk", sans-serif',
              fontSize: 12,
              letterSpacing: '0.1em',
              fontWeight: 600,
              color: '#0a1628',
              '&:hover': { opacity: 0.7, bgcolor: 'transparent' },
              display: { xs: 'none', sm: 'inline-flex' },
              gap: 1,
              alignItems: 'center',
            }}
          >
            VIEW ALL →
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
            {[0, 1, 2].map((i) => (
              <Box
                key={i}
                sx={{
                  flex: '1 1 0',
                  maxWidth: 400,
                  aspectRatio: '4/5',
                  bgcolor: 'rgba(0,53,39,0.06)',
                }}
              />
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 5,
            }}
          >
            {units.map((unit, index) => (
              <motion.div
                key={unit.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                <Box
                  onClick={() => navigate(`/unit/${unit.id}`)}
                  sx={{ cursor: 'pointer', borderRadius: { xs: 3, md: 4 }, overflow: 'hidden' }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      aspectRatio: '4/5',
                      overflow: 'hidden',
                      '&:hover img': { transform: 'scale(1.05)' },
                    }}
                  >
                    <Box
                      component="img"
                      src={unit.images?.[0] || '/placeholder.jpg'}
                      alt={unit.unitNumber}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.7s',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        bgcolor: '#2a3546',
                        px: 2,
                        py: 0.5,
                        fontFamily: '"Hanken Grotesk", sans-serif',
                        fontSize: 10,
                        letterSpacing: '0.1em',
                        fontWeight: 600,
                        color: '#d7e3f9',
                      }}
                    >
                      FEATURED
                    </Box>
                  </Box>
                  <Box sx={{ p: { xs: 4, md: 5 } }}>
                    <Typography
                      sx={{
                        fontFamily: '"Hanken Grotesk", sans-serif',
                        fontSize: 12,
                        letterSpacing: '0.1em',
                        fontWeight: 600,
                        color: '#0a1628',
                        mb: 1,
                        textTransform: 'uppercase',
                      }}
                    >
                      {unit.projectName || 'Luxury Property'}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{ mb: 2 }}
                    >
                      {unit.projectName || `Unit ${unit.unitNumber}`}
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontFamily: '"Hanken Grotesk", sans-serif', fontSize: 12, letterSpacing: '0.1em', fontWeight: 600, color: '#c5c6cd' }}>
                          {unit.bedrooms || '—'} BEDS
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontFamily: '"Hanken Grotesk", sans-serif', fontSize: 12, letterSpacing: '0.1em', fontWeight: 600, color: '#c5c6cd' }}>
                          {unit.area ? `${Math.round(unit.area).toLocaleString()} SQFT` : '—'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#0a1628' }}>
                        {formatPrice(unit.price)}
                      </Typography>
                      <Typography sx={{ color: '#0a1628', fontSize: 24, transition: 'transform 0.3s', '&:hover': { transform: 'translateX(4px)' } }}>
                        →
                      </Typography>
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
