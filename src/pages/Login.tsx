import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { login } from '../lib/api-client'
import { useAuthStore } from '../lib/store'
import LanguageToggle from '../components/ui/LanguageToggle'
import SiteContactBar from '../components/layout/SiteContactBar'
import Footer from '../components/layout/Footer'
import BrandLogo from '../components/layout/BrandLogo'
import AnimatedBackground from '../components/layout/AnimatedBackground'

export default function Login() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { setAuth, setLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const schema = z.object({
    username: z.string().min(1, t('login.usernameRequired')),
    password: z.string().min(1, t('login.passwordRequired')),
  })

  type FormData = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError(null)
    setLoading(true)

    try {
      const response = await login(data.username, data.password)

      if (response.success && response.data) {
        setAuth(response.data.user, null)
        navigate('/community')
      } else {
        setError(response.error || t('login.errorGeneric'))
      }
    } catch {
      setError(t('login.errorGeneric'))
    } finally {
      setLoading(false)
    }
  }

  const isRtl = i18n.language === 'ar'

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'transparent', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <AnimatedBackground />
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
          {isRtl ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
          <Typography variant="body2" color="text.secondary">
            {t('login.backToHome')}
          </Typography>
        </Link>
        <LanguageToggle />
      </Box>

      <Container maxWidth="sm" sx={{ flex: 1, display: 'flex', alignItems: 'center', py: 4 }}>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ mb: 2 }}>
              <BrandLogo variant="login" />
            </Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {t('login.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('login.subtitle')}
            </Typography>
          </Box>

          <Card
            sx={(theme) => ({
              backgroundColor: alpha(theme.palette.background.paper, 0.6),
              backdropFilter: 'blur(16px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
            })}
          >
            <CardContent sx={{ p: 3 }}>
              <form onSubmit={handleSubmit(onSubmit)}>
                <TextField
                  {...register('username')}
                  label={t('login.username')}
                  placeholder={t('login.username')}
                  fullWidth
                  error={!!errors.username}
                  helperText={errors.username?.message}
                  sx={{ mb: 2 }}
                />

                <TextField
                  {...register('password')}
                  label={t('login.password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('login.password')}
                  fullWidth
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={{ mb: 2 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Button type="submit" variant="contained" fullWidth size="large" disabled={isSubmitting}>
                  {isSubmitting ? t('login.submitting') : t('login.submit')}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
            {t('login.noAccount')}{' '}
            <Link to="/contact" style={{ color: 'inherit', textDecoration: 'underline' }}>
              {t('login.contactUs')}
            </Link>
          </Typography>
        </Box>
      </Container>

      <SiteContactBar />
      <Footer />
    </Box>
  )
}

