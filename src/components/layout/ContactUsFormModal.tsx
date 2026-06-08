import { Dialog, DialogTitle, DialogContent, Button, Box, Typography } from '@mui/material'
import { Close } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import LeadInterestForm from '../home/LeadInterestForm'
import FadeSlideFromTop from './FadeSlideFromTop'

interface ContactUsFormModalProps {
  open: boolean
  onClose: () => void
}

export default function ContactUsFormModal({ open, onClose }: ContactUsFormModalProps) {
  const { t } = useTranslation()

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      slots={{ transition: FadeSlideFromTop }}
      slotProps={{
        transition: {
          timeout: 500,
          easing: {
            enter: 'cubic-bezier(0.16, 1, 0.3, 1)',
            exit: 'cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
        backdrop: {
          sx: { backdropFilter: 'blur(4px)' },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {t('contact.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('contact.description')}
            </Typography>
          </Box>
          <Button onClick={onClose} sx={{ minWidth: 'auto', p: 1 }} aria-label={t('common.close')}>
            <Close />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <LeadInterestForm
          mode="dialog"
          active={open}
          onCancel={onClose}
          onDialogFlowComplete={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
