import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

import { DEMO_CONFIG } from '../../lib/demo-config'

export const BRAND_LOGO_SRC = DEMO_CONFIG.brand.logo.vertical

type BrandLogoVariant = 'header' | 'footer' | 'login'

type BrandLogoProps = { variant: BrandLogoVariant }

/** Renders the brand logo with no wrapper background so transparent PNGs show correctly. */
export default function BrandLogo({ variant }: BrandLogoProps) {
  const { t } = useTranslation()

  const height =
    variant === 'header'
      ? { xs: 100, sm: 120 }
      : variant === 'footer'
        ? { xs: 72, sm: 86 }
        : { xs: 115, sm: 130 }

  const img = (
    <Box
      component="img"
      src={BRAND_LOGO_SRC}
      alt={t('home.title', { companyName: DEMO_CONFIG.brand.nameAr })}
      sx={{
        height,
        width: 'auto',
        display: 'block',
        mx: variant === 'login' ? 'auto' : undefined,
      }}
    />
  )

  if (variant === 'login') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        {img}
      </Box>
    )
  }

  return img
}
