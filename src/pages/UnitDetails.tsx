import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  TextField,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { ArrowRight, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import UnitCard from '../components/search/UnitCard'
import RegisterInterestModal from '../components/home/RegisterInterestModal'
import ImageCarousel from '../components/ui/ImageCarousel'
import FavoriteButton from '../components/ui/FavoriteButton'
import ShareButton from '../components/ui/ShareButton'
import { getUnit } from '../lib/api-client'
import { isModelImageFile, isModelPdfFile } from '../lib/projectMedia'
import { useAuthStore, useFeatureSwitchStore } from '../lib/store'
import { Unit, ProjectModelFile } from '../lib/types'
import ProjectModelViewer from '../components/project/ProjectModelViewer'
import ProjectBrochureViewer from '../components/project/ProjectBrochureViewer'
import SubsidyBadges from '../components/units/SubsidyBadges'
import CurrencyIcon from '../components/ui/CurrencyIcon'
import FinanceCalculatorModal, { SakaniMathIcon } from '../components/ui/FinanceCalculatorModal'

export default function UnitDetails() {
  const { t, i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { getFeature } = useFeatureSwitchStore()
  const [unit, setUnit] = useState<Unit | null>(null)
  const [relatedUnits, setRelatedUnits] = useState<Unit[]>([])
  const [modelFile, setModelFile] = useState<ProjectModelFile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [modelViewerOpen, setModelViewerOpen] = useState(false)

  useEffect(() => {
    async function loadUnit() {
      if (!id) return
      setIsLoading(true)
      try {
        const response = await getUnit(id)
        if (response.success && response.data) {
          setUnit(response.data.unit)
          setRelatedUnits(response.data.relatedUnits)
          setModelFile(response.data.modelFile ?? null)
        }
      } catch (error) {
        console.error('Error loading unit:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadUnit()
  }, [id])

  const formatPrice = (price: number) => {
    const formatted = new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(price)
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {formatted}
        <CurrencyIcon theme="light" className="mx-2" />
      </Box>
    )
  }

  const STATS_ICONS: Record<string, string> = {
    bed: 'bed',
    bathtub: 'bathtub',
    area: 'square_foot',
  }

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!unit) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          {i18n.language === 'ar' ? 'الوحدة غير موجودة' : 'Unit not found'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {i18n.language === 'ar' ? 'عذراً، لم نتمكن من العثور على هذه الوحدة' : 'Sorry, we couldn\'t find this unit'}
        </Typography>
        <Button variant="contained" onClick={() => navigate('/search')}>
          {i18n.language === 'ar' ? 'العودة للبحث' : 'Back to search'}
        </Button>
      </Container>
    )
  }

  const statusColors: Partial<Record<Unit['status'], 'success' | 'warning' | 'error'>> = {
    Available: 'success',
    Reserved: 'warning',
    Sold: 'error',
  }

  const statusLabels: Partial<Record<Unit['status'], string>> = {
    Available: i18n.language === 'ar' ? 'متاح' : 'Available',
    Reserved: i18n.language === 'ar' ? 'محجوز' : 'Reserved',
    Sold: i18n.language === 'ar' ? 'مباع' : 'Sold',
  }

  const mainImage = unit.images?.[0] || ''
  const secondaryImages = unit.images?.slice(1, 3) || []

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#071423' }}>
      {/* Top Bar */}
      <Box
        sx={{
          bgcolor: '#0a1628',
          borderBottom: '1px solid rgba(230,195,100,0.2)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
          <Button
            startIcon={<ArrowRight />}
            onClick={() => navigate(-1)}
            sx={{ color: '#e6c364', fontFamily: '"Hanken Grotesk", sans-serif', fontSize: 12, letterSpacing: '0.1em', fontWeight: 600 }}
          >
            {i18n.language === 'ar' ? 'رجوع' : 'BACK'}
          </Button>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <FavoriteButton unitId={unit.id} size="small" />
            <ShareButton
              url={`${window.location.origin}/unit/${unit.id}`}
              title={unit.projectName}
              text={`${unit.unitNumber} at ${unit.projectName}`}
              image={unit.images[0]}
              size="small"
            />
          </Box>
        </Container>
      </Box>

      {/* Hero Gallery Grid */}
      <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, md: 5 }, py: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '8fr 4fr' },
            gap: 1,
            height: { md: 600 },
          }}
        >
          <Box
            onClick={() => setIsGalleryOpen(true)}
            sx={{ overflow: 'hidden', position: 'relative', cursor: 'pointer', '&:hover img': { transform: 'scale(1.05)' } }}
          >
            <Box
              component="img"
              src={mainImage || '/placeholder.jpg'}
              alt="Main"
              sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s' }}
            />
            <Box
              sx={{
                position: 'absolute', bottom: 24, left: 24,
                bgcolor: 'rgba(0,53,39,0.1)',
                backdropFilter: 'blur(20px)',
                p: 3,
                border: '1px solid rgba(230,195,100,0.3)',
              }}
            >
              <Typography sx={{ color: '#e6c364', fontFamily: '"Hanken Grotesk", sans-serif', fontSize: 14, letterSpacing: '0.1em', fontWeight: 600, textTransform: 'uppercase' }}>
                {unit.projectName || 'Luxury Property'}
              </Typography>
            </Box>
            <Chip
              label={statusLabels[unit.status] || unit.status}
              color={statusColors[unit.status] || 'warning'}
              sx={{ position: 'absolute', top: 16, right: 16, zIndex: 4, fontWeight: 600 }}
            />
            {unit.eligibleForSubsidies && (
              <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 4 }}>
                <SubsidyBadges eligible={unit.eligibleForSubsidies} size="large" />
              </Box>
            )}
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'grid' }, gridTemplateRows: '1fr 1fr', gap: 1 }}>
            {secondaryImages.length > 0 ? (
              secondaryImages.map((img, i) => (
                <Box
                  key={i}
                  onClick={() => setIsGalleryOpen(true)}
                  sx={{ overflow: 'hidden', cursor: 'pointer', '&:hover img': { transform: 'scale(1.05)' } }}
                >
                  <Box
                    component="img"
                    src={img}
                    alt={`View ${i + 1}`}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s' }}
                  />
                </Box>
              ))
            ) : (
              <>
                <Box sx={{ bgcolor: '#2a3546' }} />
                <Box sx={{ bgcolor: '#2a3546' }} />
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* Pricing & Stats Bar */}
      <Box
        sx={{
          bgcolor: '#0a1628',
          borderTop: '1px solid rgba(230,195,100,0.2)',
          borderBottom: '1px solid rgba(230,195,100,0.2)',
          position: 'sticky',
          top: 56,
          zIndex: 40,
        }}
      >
        <Box
          sx={{
            maxWidth: 1440,
            mx: 'auto',
            px: { xs: 2, md: 5 },
            py: { xs: 2, md: 2.5 },
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box>
            <Typography sx={{ color: 'rgba(230,195,100,0.7)', fontFamily: '"Hanken Grotesk", sans-serif', fontSize: 12, letterSpacing: '0.1em', fontWeight: 500, textTransform: 'uppercase' }}>
              {i18n.language === 'ar' ? 'القيمة الاستثمارية' : 'Investment Value'}
            </Typography>
            <Typography sx={{ color: '#e6c364', fontFamily: '"Hanken Grotesk", sans-serif', fontSize: { xs: 28, md: 36 }, fontWeight: 500 }}>
              {formatPrice(unit.price)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: { xs: 3, md: 5 }, overflowX: 'auto', pb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ fontFamily: '"Hanken Grotesk", sans-serif', color: '#e6c364', fontSize: { xs: 24, md: 32 }, fontWeight: 300 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 'inherit' }}>bed</span>
              </Typography>
              <Box>
                <Typography sx={{ color: '#ffffff', fontFamily: '"Hanken Grotesk", sans-serif', fontSize: { xs: 20, md: 28 }, fontWeight: 500, lineHeight: 1 }}>
                  {String(unit.bedrooms).padStart(2, '0')}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontFamily: '"Hanken Grotesk", sans-serif', fontSize: 12, letterSpacing: '0.1em', fontWeight: 500, textTransform: 'uppercase' }}>
                  {i18n.language === 'ar' ? 'غرف نوم' : 'Bedrooms'}
                </Typography>
              </Box>
            </Box>
            {unit.bathrooms && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ fontFamily: '"Hanken Grotesk", sans-serif', color: '#e6c364', fontSize: { xs: 24, md: 32 }, fontWeight: 300 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 'inherit' }}>bathtub</span>
                </Typography>
                <Box>
                  <Typography sx={{ color: '#ffffff', fontFamily: '"Hanken Grotesk", sans-serif', fontSize: { xs: 20, md: 28 }, fontWeight: 500, lineHeight: 1 }}>
                    {String(unit.bathrooms).padStart(2, '0')}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontFamily: '"Hanken Grotesk", sans-serif', fontSize: 12, letterSpacing: '0.1em', fontWeight: 500, textTransform: 'uppercase' }}>
                    {i18n.language === 'ar' ? 'حمامات' : 'Bathrooms'}
                  </Typography>
                </Box>
              </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ fontFamily: '"Hanken Grotesk", sans-serif', color: '#e6c364', fontSize: { xs: 24, md: 32 }, fontWeight: 300 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 'inherit' }}>square_foot</span>
              </Typography>
              <Box>
                <Typography sx={{ color: '#ffffff', fontFamily: '"Hanken Grotesk", sans-serif', fontSize: { xs: 20, md: 28 }, fontWeight: 500, lineHeight: 1 }}>
                  {unit.area ? Math.round(unit.area).toLocaleString() : '—'}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontFamily: '"Hanken Grotesk", sans-serif', fontSize: 12, letterSpacing: '0.1em', fontWeight: 500, textTransform: 'uppercase' }}>
                  {i18n.language === 'ar' ? 'مساحة' : 'Sq Ft'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ mt: { xs: 3, md: 6 }, mb: 10 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: { xs: 4, md: 6 } }}>
          {/* Left Column */}
          <Box>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              {/* Description */}
              <Box sx={{ mb: { xs: 4, md: 6 } }}>
                <Typography variant="h2" sx={{ mb: 2 }}>
                  {i18n.language === 'ar' ? 'نبذة عن العقار' : 'Property Overview'}
                </Typography>
                <Box sx={{ width: 96, height: 4, bgcolor: '#e6c364', mb: 3 }} />
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, fontSize: 18 }}>
                  {i18n.language === 'ar' ? unit.descriptionAr : unit.description || 'Experience luxury living at its finest in this exceptional property.'}
                </Typography>
              </Box>

              {/* Amenity Bento Grid */}
              {unit.amenities && unit.amenities.length > 0 && (
                <Box sx={{ mb: { xs: 4, md: 6 } }}>
                  <Typography variant="h3" sx={{ mb: 3 }}>
                    {i18n.language === 'ar' ? 'المرافق' : 'Amenities & Features'}
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 2 }}>
                    {unit.amenities.map((amenity, index) => (
                      <Box
                        key={index}
                        sx={{
                          bgcolor: '#1f2b3b',
                          border: '1px solid rgba(230,195,100,0.1)',
                          p: 4,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          gap: 1.5,
                          transition: 'all 0.3s',
                          '&:hover': { bgcolor: '#0a1628', '& .amenity-label': { color: '#ffffff' }, '& .amenity-icon': { color: '#e6c364' } },
                        }}
                      >
                        <Check size={24} className="amenity-icon" style={{ color: '#0a1628', transition: 'color 0.3s' }} />
                        <Typography className="amenity-label" sx={{ fontFamily: '"Hanken Grotesk", sans-serif', fontSize: 12, letterSpacing: '0.1em', fontWeight: 600, textTransform: 'uppercase', transition: 'color 0.3s' }}>
                          {amenity}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Model Layout */}
              {modelFile && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h3" sx={{ mb: 2 }}>
                    {t('unit.modelLayout', 'Unit Model Layout')}
                    {unit.model && (
                      <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({unit.model})
                      </Typography>
                    )}
                  </Typography>
                  <Card
                    onClick={() => setModelViewerOpen(true)}
                    sx={{
                      overflow: 'hidden',
                      cursor: 'pointer',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                      transition: 'box-shadow 0.2s, transform 0.2s',
                      '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.12)', transform: 'translateY(-2px)' },
                    }}
                  >
                    {isModelPdfFile(modelFile.fileExtension) ? (
                      <Box sx={{ height: { xs: 320, md: 420 }, bgcolor: '#1a1a1a', pointerEvents: 'none' }}>
                        <ProjectBrochureViewer pdfUrl={modelFile.url} />
                      </Box>
                    ) : isModelImageFile(modelFile.fileExtension) ? (
                      <Box
                        component="img"
                        src={modelFile.url}
                        alt={modelFile.title}
                        sx={{ width: '100%', display: 'block', maxHeight: 480, objectFit: 'contain', bgcolor: '#f0f0f0', pointerEvents: 'none' }}
                      />
                    ) : (
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('project.clickToEnlarge', 'Click to enlarge')}
                        </Typography>
                      </Box>
                    )}
                  </Card>
                </Box>
              )}

              {/* Floor Plan */}
              {unit.floorPlan && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h3" sx={{ mb: 2 }}>
                    {i18n.language === 'ar' ? 'المخطط' : 'Floor Plan'}
                  </Typography>
                  <Card>
                    <Box component="img" src={unit.floorPlan} alt="Floor Plan" sx={{ width: '100%', height: 'auto', display: 'block' }} />
                  </Card>
                </Box>
              )}

              {/* 3D View */}
              {unit.sketchupEmbedUrl && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h3" sx={{ mb: 2 }}>
                    {i18n.language === 'ar' ? 'عرض ثلاثي الأبعاد' : '3D View'}
                  </Typography>
                  <Card>
                    <Box sx={{ position: 'relative', width: '100%', paddingBottom: '56.25%', overflow: 'hidden', bgcolor: '#f0f0f0' }}>
                      <Box
                        component="iframe"
                        src={unit.sketchupEmbedUrl}
                        sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', display: 'block' }}
                        allowFullScreen
                        title="3D Unit View"
                      />
                    </Box>
                  </Card>
                </Box>
              )}
            </motion.div>
          </Box>

          {/* Right Column — Sidebar Form */}
          <Box>
            <Box sx={{ position: 'sticky', top: 130 }}>
              <Box sx={{ bgcolor: '#0a1628', p: { xs: 3, md: 4 }, border: '1px solid rgba(230,195,100,0.3)' }}>
                <Typography sx={{ color: '#e6c364', fontFamily: '"Hanken Grotesk", sans-serif', fontSize: 24, fontWeight: 500, mb: 1 }}>
                  {i18n.language === 'ar' ? 'طلب محفظة استثمارية' : 'Request Private Portfolio'}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontFamily: '"Hanken Grotesk", sans-serif', fontSize: 12, letterSpacing: '0.1em', fontWeight: 500, textTransform: 'uppercase', mb: 3 }}>
                  {i18n.language === 'ar' ? 'استفسار سري للمستثمرين المعتمدين فقط' : 'Confidential inquiry for qualified investors only.'}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    placeholder={i18n.language === 'ar' ? 'الاسم الكامل...' : 'Full legal name...'}
                    variant="standard"
                    slotProps={{
                      input: {
                        disableUnderline: true,
                        sx: { color: '#ffffff', px: 0, py: 1, fontSize: 14, '&::placeholder': { color: 'rgba(255,255,255,0.4)', opacity: 1 } },
                      },
                    }}
                    sx={{ borderBottom: '1px solid rgba(255,255,255,0.2)', '&:focus-within': { borderBottomColor: '#e6c364' } }}
                  />
                  <TextField
                    placeholder={i18n.language === 'ar' ? 'البريد الإلكتروني...' : 'Email address...'}
                    variant="standard"
                    slotProps={{
                      input: {
                        disableUnderline: true,
                        sx: { color: '#ffffff', px: 0, py: 1, fontSize: 14, '&::placeholder': { color: 'rgba(255,255,255,0.4)', opacity: 1 } },
                      },
                    }}
                    sx={{ borderBottom: '1px solid rgba(255,255,255,0.2)', '&:focus-within': { borderBottomColor: '#e6c364' } }}
                  />
                  <FormControl variant="standard" sx={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                    <Select
                      defaultValue="Middle East & GCC"
                      disableUnderline
                      slotProps={{
                        root: { sx: { color: '#ffffff', fontSize: 14, py: 1, '& .MuiSvgIcon-root': { color: '#e6c364' } } },
                      }}
                    >
                      <MenuItem value="Middle East & GCC">Middle East & GCC</MenuItem>
                      <MenuItem value="Europe">Europe</MenuItem>
                      <MenuItem value="North America">North America</MenuItem>
                      <MenuItem value="Asia Pacific">Asia Pacific</MenuItem>
                    </Select>
                  </FormControl>

                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Box
                      sx={{ px: 3, py: 1, border: '1px solid rgba(230,195,100,0.3)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { bgcolor: '#e6c364', '& .type-label': { color: '#0a1628' } } }}
                    >
                      <Typography className="type-label" sx={{ color: '#e6c364', fontFamily: '"Hanken Grotesk", sans-serif', fontSize: 12, letterSpacing: '0.1em', fontWeight: 600, textTransform: 'uppercase', transition: 'color 0.2s' }}>
                        {i18n.language === 'ar' ? 'استثمار' : 'Investment'}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ px: 3, py: 1, border: '1px solid rgba(230,195,100,0.3)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { bgcolor: '#e6c364', '& .type-label': { color: '#0a1628' } } }}
                    >
                      <Typography className="type-label" sx={{ color: '#e6c364', fontFamily: '"Hanken Grotesk", sans-serif', fontSize: 12, letterSpacing: '0.1em', fontWeight: 600, textTransform: 'uppercase', transition: 'color 0.2s' }}>
                        {i18n.language === 'ar' ? 'سكن' : 'Residence'}
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    fullWidth
                    sx={{
                      bgcolor: '#e6c364',
                      color: '#0a1628',
                      fontFamily: '"Hanken Grotesk", sans-serif',
                      fontSize: 14,
                      letterSpacing: '0.2em',
                      fontWeight: 600,
                      py: 2,
                      mt: 2,
                      '&:hover': { bgcolor: '#ffe08f' },
                    }}
                    onClick={() => setIsRegisterModalOpen(true)}
                  >
                    {i18n.language === 'ar' ? 'بدء الطلب' : 'Initiate Request'}
                  </Button>
                </Box>

                <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontFamily: '"Hanken Grotesk", sans-serif', color: '#e6c364', fontSize: 16 }}>verified_user</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontFamily: '"Hanken Grotesk", sans-serif', fontSize: 10, letterSpacing: '0.1em', fontWeight: 500, textTransform: 'uppercase' }}>
                      {i18n.language === 'ar' ? 'تشفير كامل' : 'End-to-End Encryption'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* CTAs */}
              <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={() => setIsRegisterModalOpen(true)}
                  disabled={unit.status === 'Sold'}
                  sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    bgcolor: '#0a1628',
                    color: '#ffffff',
                    '&:hover': { bgcolor: '#1f2b3b' },
                  }}
                >
                  {unit.status === 'Sold' ? t('unit.sold') : t('unit.registerInterest')}
                </Button>

                {getFeature('Enable_Funding_Calculator__c', true) && (
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    onClick={() => setIsCalculatorOpen(true)}
                    startIcon={<SakaniMathIcon color="#0a1628" />}
                    sx={{
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      borderColor: 'rgba(0,0,0,0.12)',
                      color: '#0a1628',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1.5,
                      '&:hover': { bgcolor: 'rgba(0,53,39,0.04)', borderColor: '#0a1628' },
                    }}
                  >
                    {i18n.language === 'ar' ? 'حاسبة التمويل العقاري' : 'Mortgage Calculator'}
                  </Button>
                )}

                {user && (
                  <Button component={Link} to="/community" variant="outlined" size="large" fullWidth>
                    {t('unit.openSupportCase')}
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Related Units */}
        {relatedUnits.length > 0 && (
          <Box sx={{ mt: 8 }}>
            <Typography variant="h2" sx={{ mb: 4 }}>
              {t('unit.similarUnits')}
            </Typography>
            <Grid container spacing={3}>
              {relatedUnits.map((relatedUnit) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={relatedUnit.id}>
                  <UnitCard unit={relatedUnit} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>

      {/* Modals */}
      <RegisterInterestModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        projectId={unit.projectId}
        phaseId={unit.phaseId}
        unitId={unit.id}
        projectName={unit.projectNameAr || unit.projectName}
        fallbackProvinceRegion={unit.projectProvinceRegion}
        fallbackCity={unit.projectCity}
      />

      <FinanceCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        propertyPrice={unit.price}
        onBookClick={() => setIsRegisterModalOpen(true)}
      />

      {isGalleryOpen && (
        <ImageGallery
          images={unit.images}
          initialIndex={0}
          onClose={() => setIsGalleryOpen(false)}
        />
      )}

      <ProjectModelViewer
        isOpen={modelViewerOpen}
        onClose={() => setModelViewerOpen(false)}
        url={modelFile?.url ?? null}
        title={
          modelFile
            ? unit.model || t('project.modelLabel', { number: modelFile.number, defaultValue: `Model ${modelFile.number}` })
            : null
        }
        fileExtension={modelFile?.fileExtension}
      />
    </Box>
  )
}
