import { Box, Typography, Button, Container } from '@mui/material'
import { WifiOff, RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import SiteContactBar from '../components/layout/SiteContactBar'
import Footer from '../components/layout/Footer'

export default function Offline() {
  const { t } = useTranslation()

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        py: 4,
      }}
    >
      <Box sx={{ textAlign: 'center', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'grey.100',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
          }}
        >
          <WifiOff size={40} color="#718096" />
        </Box>

        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {t('offline.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {t('offline.description')}
        </Typography>

        <Button variant="contained" size="large" onClick={handleRefresh} startIcon={<RefreshCcw size={20} />}>
          {t('offline.retry')}
        </Button>
      </Box>

      <SiteContactBar />
      <Footer />
    </Container>
  )
}

