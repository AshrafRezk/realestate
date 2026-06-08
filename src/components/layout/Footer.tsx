import { Box, Container, Link, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import BrandLogo from './BrandLogo'
import { DEMO_CONFIG } from '../../lib/demo-config'

export default function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        borderTop: 1,
        borderColor: 'divider',
        py: { xs: 2, md: 2},
        bgcolor: 'background.paper',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <BrandLogo variant="footer" />
        </Box>

        <Box sx={{ textAlign: 'center', mt: 2.5 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            component="p"
            sx={{ mb: 0.5 }}
          >
            {t('footer.copyright', { year, companyName: DEMO_CONFIG.brand.nameAr })}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            component="p"
            sx={{ fontSize: '0.7rem', opacity: 0.8, mb: 0 }}
          >
            {t('footer.developedBy', 'Developed with love by')}{' '}
            <Link
              href="https://cloudastick.com"
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
              underline="hover"
              sx={{ fontWeight: 600 }}
            >
              Cloudastick
            </Link>{' '}
            - Salesforce Partner
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}
