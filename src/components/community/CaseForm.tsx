import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  MenuItem,
  IconButton,
} from '@mui/material'
import { X, Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { createCase } from '../../lib/api-client'
import { Unit } from '../../lib/types'

interface CaseFormProps {
  isOpen: boolean
  onClose: () => void
  units: Unit[]
  onSuccess: () => void
}

export default function CaseForm({ isOpen, onClose, units, onSuccess }: CaseFormProps) {
  const { t, i18n } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isRtl = i18n.language === 'ar'

  const schema = z
    .object({
      unitId: z.string().optional(),
      subject: z.string().min(5, t('cases.form.validation.subjectRequired')),
      category: z.enum(['Maintenance', 'Inquiry', 'Complaint', 'Documentation', 'Other']),
      description: z.string().min(10, t('cases.form.validation.descriptionRequired')),
    })
    .superRefine((data, ctx) => {
      if (units.length > 0 && !data.unitId?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['unitId'],
          message: t('cases.form.validation.unitRequired'),
        })
      }
    })

  type FormData = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: 'Inquiry',
      unitId: units.length === 1 ? units[0].id : '',
    },
  })

  useEffect(() => {
    if (!isOpen) return
    reset({
      category: 'Inquiry',
      unitId: units.length === 1 ? units[0].id : '',
      subject: '',
      description: '',
    })
    setError(null)
    setIsSuccess(false)
  }, [isOpen, units, reset])

  const categoryOptions = [
    { value: 'Maintenance', label: t('cases.category.maintenance') },
    { value: 'Inquiry', label: t('cases.category.inquiry') },
    { value: 'Complaint', label: t('cases.category.complaint') },
    { value: 'Documentation', label: t('cases.category.documentation') },
    { value: 'Other', label: t('cases.category.other') },
  ]

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const selectedUnit = data.unitId ? units.find((u) => u.id === data.unitId) : undefined
      const projectName = selectedUnit
        ? isRtl
          ? selectedUnit.projectNameAr || selectedUnit.projectName
          : selectedUnit.projectName || selectedUnit.projectNameAr
        : undefined

      const response = await createCase({
        unitId: data.unitId?.trim() || undefined,
        projectName,
        subject: data.subject,
        category: data.category,
        description: data.description,
      })

      if (response.success) {
        setIsSuccess(true)
        reset()
        setTimeout(() => {
          onSuccess()
          onClose()
          setIsSuccess(false)
        }, 1500)
      } else {
        setError(response.error || t('cases.form.error'))
      }
    } catch {
      setError(t('cases.form.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      setError(null)
      setIsSuccess(false)
      reset()
    }
  }

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4, p: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ textAlign: isRtl ? 'right' : 'left' }}>
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              {t('cases.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('cases.subtitle')}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={isSubmitting} size="small">
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 + ' !important' }}>
        {isSuccess ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Box 
              sx={{ 
                width: 64, 
                height: 64, 
                bgcolor: 'success.light', 
                color: 'success.main', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 16px' 
              }}
            >
              <Check size={32} />
            </Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {t('cases.form.successTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('cases.form.successMessage')}
            </Typography>
          </Box>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              {units.length > 0 && (
                <TextField
                  {...register('unitId')}
                  select
                  required
                  label={t('cases.form.unit')}
                  fullWidth
                  error={!!errors.unitId}
                  helperText={errors.unitId?.message}
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  onChange={(e) => setValue('unitId', e.target.value, { shouldValidate: true })}
                >
                  <MenuItem value="">{t('cases.form.chooseUnit')}</MenuItem>
                  {units.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.unitNumber}
                      {u.projectName ? ` — ${isRtl ? u.projectNameAr || u.projectName : u.projectName}` : ''}
                    </MenuItem>
                  ))}
                </TextField>
              )}

              <TextField
                {...register('category')}
                select
                label={t('cases.form.type')}
                fullWidth
                error={!!errors.category}
                helperText={errors.category?.message}
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                {categoryOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                {...register('subject')}
                label={t('cases.form.subject')}
                placeholder={t('cases.form.subjectPlaceholder')}
                fullWidth
                error={!!errors.subject}
                helperText={errors.subject?.message}
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <TextField
                {...register('description')}
                label={t('cases.form.details')}
                placeholder={t('cases.form.detailsPlaceholder')}
                fullWidth
                multiline
                rows={4}
                error={!!errors.description}
                helperText={errors.description?.message}
                variant="outlined"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              {error && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
              )}
            </Box>

            <DialogActions sx={{ px: 0, pt: 4, pb: 1, gap: 2 }}>
              <Button 
                onClick={handleClose} 
                disabled={isSubmitting}
                sx={{ fontWeight: 'bold' }}
              >
                {t('cases.form.cancel')}
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={isSubmitting}
                sx={{ 
                  bgcolor: 'primary.main', 
                  px: 4, 
                  py: 1.25, 
                  borderRadius: 2,
                  fontWeight: 'bold',
                  flexGrow: 1
                }}
              >
                {isSubmitting ? t('cases.form.submitting') : t('cases.form.submit')}
              </Button>
            </DialogActions>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
