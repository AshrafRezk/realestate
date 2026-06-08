import { useState, useEffect } from 'react'
import {
  Box,
  Dialog,
  DialogContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  Stack,
  Divider,
} from '@mui/material'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// ─── Currency icon ────────────────────────────────────────────────────────────
const CurrencyIcon = ({ size = '1em' }: { size?: string | number }) => (
  <span style={{ display: 'inline-block', verticalAlign: 'middle', fontSize: size, fontWeight: 600, flexShrink: 0 }}>
    EGP
  </span>
)

// ─── Exported icon used by other pages ────────────────────────────────────────
export const SakaniMathIcon = ({ color = 'currentColor', size = 24 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <line x1="7" y1="17" x2="17" y2="7" />
    <line x1="7" y1="9" x2="11" y2="9" />
    <line x1="9" y1="7" x2="9" y2="11" />
    <line x1="13" y1="15" x2="17" y2="15" />
  </svg>
)

// ─── Types ────────────────────────────────────────────────────────────────────
interface FinanceCalculatorModalProps {
  isOpen: boolean
  onClose: () => void
  propertyPrice: number
  onBookClick?: () => void
}

interface CalcResults {
  monthlyInstallment: string
  totalFinancing: string
  totalInterest: string
  endDateLabel: string
  isExempt: boolean
  downPaymentAmount: string
  originalPrincipal: string
  subsidyAmount: string
  interestRatioPct: number
}

// ─── Helper sub-components ────────────────────────────────────────────────────
const FieldLabel = ({ text, required }: { text: string; required?: boolean }) => (
  <Typography
    variant="body2"
    fontWeight="600"
    sx={{ mb: 0.75, color: 'text.primary', fontSize: '0.9rem' }}
  >
    {text}
    {required && <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Box>}
  </Typography>
)

// ─── Main component ───────────────────────────────────────────────────────────
export default function FinanceCalculatorModal({
  isOpen,
  onClose,
  propertyPrice: initialPropertyPrice,
  onBookClick,
}: FinanceCalculatorModalProps) {
  const { i18n } = useTranslation()
  const isRtl = i18n.language.startsWith('ar')

  // ── Form state ──────────────────────────────────────────────────────────────
  const [propertyPrice, setPropertyPrice] = useState<string>('')
  const [monthlyIncome, setMonthlyIncome] = useState<string>('')
  const [obligations, setObligations] = useState<string>('')
  const [period, setPeriod] = useState<string>('20')
  const [interestRate, setInterestRate] = useState<string>('4.5')
  const [downPayment, setDownPayment] = useState<string>('10')
  const [isFirstHome, setIsFirstHome] = useState<boolean>(true)
  const [isSupported, setIsSupported] = useState<boolean>(true)

  // ── Validation ──────────────────────────────────────────────────────────────
  const [errors, setErrors] = useState<{
    monthlyIncome?: string
    period?: string
    downPayment?: string
  }>({})

  // ── View state: 0 = form, 1 = results ──────────────────────────────────────
  const [viewState, setViewState] = useState<number>(0)
  const [results, setResults] = useState<CalcResults | null>(null)

  // ── Pre-fill property price when modal opens ────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setPropertyPrice(initialPropertyPrice ? String(initialPropertyPrice) : '')
      setViewState(0)
      setMonthlyIncome('')
      setObligations('')
      setPeriod('20')
      setInterestRate('4.5')
      setDownPayment('10')
      setIsFirstHome(true)
      setIsSupported(true)
      setErrors({})
    }
  }, [isOpen, initialPropertyPrice])

  // ── Validation logic ────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: typeof errors = {}
    const income = parseFloat(monthlyIncome)
    const periodVal = parseFloat(period)
    const dpVal = parseFloat(downPayment)

    if (!monthlyIncome || isNaN(income) || income < 2000 || income > 500000) {
      newErrors.monthlyIncome = isRtl
        ? 'يجب أن تكون القيمة بين 2000 و 500000'
        : 'Value must be between 2,000 and 500,000'
    }
    if (!period || isNaN(periodVal) || periodVal < 5 || periodVal > 30) {
      newErrors.period = isRtl
        ? 'يجب أن تكون القيمة بين 5 و 30'
        : 'Value must be between 5 and 30'
    }
    if (!downPayment || isNaN(dpVal) || dpVal < 10 || dpVal > 30) {
      newErrors.downPayment = isRtl
        ? 'يجب أن تكون القيمة بين 10 و 30'
        : 'Value must be between 10 and 30'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ── Core mortgage calculation ────────────────────────────────────────────────
  const handleCalculate = () => {
    if (!validate()) return

    const price = parseFloat(propertyPrice) || 0
    const income = parseFloat(monthlyIncome) || 0
    const bankObligations = parseFloat(obligations) || 0
    const years = parseFloat(period) || 20
    const rate = parseFloat(interestRate) || 0
    const downPaymentPct = parseFloat(downPayment) || 10

    const downAmt = price * (downPaymentPct / 100)
    const principal = Math.max(0, price - downAmt)
    const totalMonths = years * 12
    const monthlyRate = rate / 100 / 12

    let rawMonthly = 0
    if (monthlyRate > 0) {
      rawMonthly =
        (principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
    } else {
      rawMonthly = principal / totalMonths
    }

    const rawTotalFinancing = rawMonthly * totalMonths
    const rawTotalInterest = Math.max(0, rawTotalFinancing - principal)

    // Sakani subsidy tiers
    let subsidyPct = 0
    if (isSupported && income > 0) {
      if (income <= 14000) subsidyPct = 100
      else if (income <= 15000) subsidyPct = 95
      else if (income <= 16000) subsidyPct = 90
      else if (income <= 17000) subsidyPct = 85
      else if (income <= 18000) subsidyPct = 80
      else if (income <= 19000) subsidyPct = 75
      else if (income <= 20000) subsidyPct = 70
      else if (income <= 25000) subsidyPct = 60
      else if (income <= 30000) subsidyPct = 50
      else subsidyPct = 35
    }

    const avgMonthlyInterest = rawTotalInterest / totalMonths
    const monthlySubsidy = avgMonthlyInterest * (subsidyPct / 100)
    const finalMonthly = Math.max(0, rawMonthly - monthlySubsidy)
    const finalTotalFinancing = finalMonthly * totalMonths
    const finalTotalInterest = Math.max(0, finalTotalFinancing - principal)

    const isExemptFromTax = isFirstHome && price <= 1000000

    const endDate = new Date()
    endDate.setFullYear(endDate.getFullYear() + Math.round(years))
    const formattedEndDate = endDate.toLocaleDateString(isRtl ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })

    const fmt = (v: number) =>
      new Intl.NumberFormat(isRtl ? 'ar-SA' : 'en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(v)

    // Percentage of bar that is interest (capped for display)
    const interestRatioPct =
      finalTotalFinancing > 0
        ? Math.max(2, Math.min(40, (finalTotalInterest / finalTotalFinancing) * 100))
        : 5

    void bankObligations // used for display in results

    setResults({
      monthlyInstallment: fmt(finalMonthly),
      totalFinancing: fmt(finalTotalFinancing),
      totalInterest: fmt(finalTotalInterest),
      endDateLabel: formattedEndDate,
      isExempt: isExemptFromTax,
      downPaymentAmount: fmt(downAmt),
      originalPrincipal: fmt(principal),
      subsidyAmount: fmt(monthlySubsidy * totalMonths),
      interestRatioPct,
    })
    setViewState(1)
  }

  const handleReset = () => {
    setPropertyPrice(initialPropertyPrice ? String(initialPropertyPrice) : '')
    setMonthlyIncome('')
    setObligations('')
    setPeriod('20')
    setInterestRate('4.5')
    setDownPayment('10')
    setIsFirstHome(true)
    setIsSupported(true)
    setErrors({})
  }

  // ── Localised labels ────────────────────────────────────────────────────────
  const L = {
    formTitle: isRtl ? 'المعلومات المالية' : 'Financial Information',
    resultsTitle: isRtl ? 'حاسبة التمويل العقاري' : 'Real Estate Finance Calculator',
    propPrice: isRtl ? 'سعر العقار' : 'Property Price',
    monthlyIncome: isRtl ? 'الدخل الشهري' : 'Monthly Income',
    obligations: isRtl ? 'الالتزامات الشهرية' : 'Monthly Obligations',
    period: isRtl ? 'فترة التمويل' : 'Financing Period',
    interestRate: isRtl ? 'نسبة الفائدة السنوي' : 'Annual Interest Rate',
    downPayment: isRtl ? 'نسبة الدفعة الأولى' : 'Down Payment %',
    firstHome: isRtl ? 'هل هذا هو منزلك الأول؟' : 'Is this your first home?',
    supported: isRtl ? 'هل أنت مستفيد؟' : 'Are you supported?',
    yes: isRtl ? 'نعم' : 'Yes',
    no: isRtl ? 'لا' : 'No',
    calculate: isRtl ? 'احسب' : 'Calculate',
    close: isRtl ? 'إغلاق' : 'Close',
    editData: isRtl ? 'تعديل البيانات' : 'Edit Data',
    bookUnit: isRtl ? 'احجز وحدة' : 'Book a Unit',
    monthlyInstallmentLabel: isRtl ? 'القسط الشهري' : 'Monthly Installment',
    perMonth: isRtl ? '/شهر' : '/mo',
    disclaimer: isRtl
      ? 'هذه النتيجة هي تقديرية ولا تضمن الموافقة على القرض أو الشروط النهائية'
      : 'This result is an estimate and does not guarantee loan approval or final terms',
    totalFinancingLabel: isRtl ? 'إجمالي مبلغ التمويل' : 'Total Financing',
    totalInterestLabel: isRtl ? 'إجمالي الفائدة' : 'Total Interest',
    noDownPaymentNote: isRtl
      ? 'اجمالي مبلغ التمويل بدون دفعه أولى'
      : 'Total financing amount excluding down payment',
    monthlyIncomeLabel: isRtl ? 'الدخل الشهري' : 'Monthly Income',
    bankObligationsLabel: isRtl ? 'الالتزامات البنكية' : 'Bank Obligations',
    interestRateLabel: isRtl ? 'سعر الفائدة' : 'Interest Rate',
    downPaymentPctLabel: isRtl ? 'نسبة الدفعة الأولى' : 'Down Payment',
    durationLabel: isRtl ? 'مدة التمويل' : 'Financing Duration',
    durationUntil: isRtl ? 'حتى ' : 'Until ',
    years: isRtl ? 'سنة' : 'years',
    exemptNotice: isRtl
      ? '🎉 تهانينا! مسكنك الأول معفى بالكامل من ضريبة التصرفات العقارية (5٪) لخصائص أقل من 1,000,000 ريال.'
      : '🎉 Congratulations! Your first home is fully exempt from the 5% Real Estate Transaction Tax for properties under 1,000,000 SAR.',
    subsidyLabel: isRtl ? 'الدعم التمويلي (سكني)' : 'Subsidized Amount (Sakani)',
  }

  // ── Adornment helpers ────────────────────────────────────────────────────────
  // In RTL the SAR icon should be on the RIGHT side (= startAdornment in MUI RTL)
  const sarAdornmentKey = isRtl ? 'startAdornment' : 'endAdornment'
  const sarAdornment = {
    [sarAdornmentKey]: (
      <Box sx={{ display: 'flex', alignItems: 'center', px: 0.25 }}>
        <CurrencyIcon size="1em" />
      </Box>
    ),
  }

  // ── Shared field styles ──────────────────────────────────────────────────────
  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      fontSize: '1rem',
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#00a3a3',
        borderWidth: 2,
      },
    },
    '& .MuiFormHelperText-root': {
      textAlign: isRtl ? 'right' : 'left',
      fontSize: '0.78rem',
      mt: 0.5,
    },
  }

  // ── Result detail row ────────────────────────────────────────────────────────
  const DetailRow = ({
    label,
    value,
    icon,
  }: {
    label: string
    value: string
    icon?: React.ReactNode
  }) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {icon}
        <Typography variant="body2" fontWeight="700" color="text.primary">
          {value}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  )

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="body"
      sx={{
        direction: isRtl ? 'rtl' : 'ltr',
        '& .MuiDialog-paper': {
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.14)',
        },
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.primary' }}>
          <X size={22} strokeWidth={2} />
        </IconButton>
        <Typography variant="h5" fontWeight="800" color="text.primary" sx={{ fontSize: { xs: '1.3rem', sm: '1.6rem' } }}>
          {viewState === 0 ? L.formTitle : L.resultsTitle}
        </Typography>
      </Box>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        {viewState === 0 ? (
          /* ════════════════════ FORM VIEW ════════════════════ */
          <Grid container spacing={2.5}>
            {/* Property Price */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel text={L.propPrice} required />
              <TextField
                fullWidth
                variant="outlined"
                value={propertyPrice}
                onChange={(e) => setPropertyPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="0"
                slotProps={{ input: sarAdornment }}
                sx={fieldSx}
              />
            </Grid>

            {/* Monthly Income */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel text={L.monthlyIncome} required />
              <TextField
                fullWidth
                variant="outlined"
                value={monthlyIncome}
                onChange={(e) => {
                  setMonthlyIncome(e.target.value.replace(/[^0-9.]/g, ''))
                  setErrors((p) => ({ ...p, monthlyIncome: undefined }))
                }}
                placeholder="0"
                error={!!errors.monthlyIncome}
                helperText={errors.monthlyIncome}
                slotProps={{ input: sarAdornment }}
                sx={fieldSx}
              />
            </Grid>

            {/* Monthly Obligations */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel text={L.obligations} />
              <TextField
                fullWidth
                variant="outlined"
                value={obligations}
                onChange={(e) => setObligations(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="0"
                slotProps={{ input: sarAdornment }}
                sx={fieldSx}
              />
            </Grid>

            {/* Financing Period */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel text={L.period} required />
              <TextField
                fullWidth
                variant="outlined"
                value={period}
                onChange={(e) => {
                  setPeriod(e.target.value.replace(/[^0-9.]/g, ''))
                  setErrors((p) => ({ ...p, period: undefined }))
                }}
                placeholder="20"
                error={!!errors.period}
                helperText={errors.period}
                slotProps={{
                  input: {
                    endAdornment: (
                      <Typography variant="body2" sx={{ color: 'text.disabled', fontWeight: 500, whiteSpace: 'nowrap', px: 0.5 }}>
                        {L.years}
                      </Typography>
                    ),
                  },
                }}
                sx={fieldSx}
              />
            </Grid>

            {/* Annual Interest Rate */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel text={L.interestRate} required />
              <TextField
                fullWidth
                variant="outlined"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="4.5"
                slotProps={{
                  input: {
                    endAdornment: (
                      <Typography variant="body2" sx={{ color: 'text.disabled', fontWeight: 500, px: 0.5 }}>
                        %
                      </Typography>
                    ),
                  },
                }}
                sx={fieldSx}
              />
            </Grid>

            {/* Down Payment */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel text={L.downPayment} required />
              <TextField
                fullWidth
                variant="outlined"
                value={downPayment}
                onChange={(e) => {
                  setDownPayment(e.target.value.replace(/[^0-9.]/g, ''))
                  setErrors((p) => ({ ...p, downPayment: undefined }))
                }}
                placeholder="10"
                error={!!errors.downPayment}
                helperText={errors.downPayment}
                slotProps={{
                  input: {
                    endAdornment: (
                      <Typography variant="body2" sx={{ color: 'text.disabled', fontWeight: 500, px: 0.5 }}>
                        %
                      </Typography>
                    ),
                  },
                }}
                sx={fieldSx}
              />
            </Grid>

            {/* Is first home? */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel text={L.firstHome} required />
              <RadioGroup
                row
                value={isFirstHome ? 'yes' : 'no'}
                onChange={(e) => setIsFirstHome(e.target.value === 'yes')}
                sx={{ gap: 2 }}
              >
                <FormControlLabel
                  value="yes"
                  label={L.yes}
                  control={
                    <Radio
                      sx={{
                        color: '#ccc',
                        '&.Mui-checked': { color: '#00a3a3' },
                        '& .MuiSvgIcon-root': { fontSize: 22 },
                      }}
                    />
                  }
                />
                <FormControlLabel
                  value="no"
                  label={L.no}
                  control={
                    <Radio
                      sx={{
                        color: '#ccc',
                        '&.Mui-checked': { color: '#00a3a3' },
                        '& .MuiSvgIcon-root': { fontSize: 22 },
                      }}
                    />
                  }
                />
              </RadioGroup>
            </Grid>

            {/* Is Sakani beneficiary? */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FieldLabel text={L.supported} required />
              <RadioGroup
                row
                value={isSupported ? 'yes' : 'no'}
                onChange={(e) => setIsSupported(e.target.value === 'yes')}
                sx={{ gap: 2 }}
              >
                <FormControlLabel
                  value="yes"
                  label={L.yes}
                  control={
                    <Radio
                      sx={{
                        color: '#ccc',
                        '&.Mui-checked': { color: '#00a3a3' },
                        '& .MuiSvgIcon-root': { fontSize: 22 },
                      }}
                    />
                  }
                />
                <FormControlLabel
                  value="no"
                  label={L.no}
                  control={
                    <Radio
                      sx={{
                        color: '#ccc',
                        '&.Mui-checked': { color: '#00a3a3' },
                        '& .MuiSvgIcon-root': { fontSize: 22 },
                      }}
                    />
                  }
                />
              </RadioGroup>
            </Grid>
          </Grid>
        ) : (
          /* ════════════════════ RESULTS VIEW ════════════════════ */
          results && (
            <Box>
              {/* ── Monthly installment card ── */}
              <Box
                sx={{
                  bgcolor: '#f8f9fa',
                  borderRadius: 3,
                  p: { xs: 2.5, sm: 3.5 },
                  textAlign: 'center',
                  mb: 3,
                }}
              >
                <Typography variant="body2" color="text.secondary" fontWeight="600" sx={{ mb: 1 }}>
                  {L.monthlyInstallmentLabel}
                </Typography>

                {/* Big amount row */}
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    mb: 1,
                    direction: 'ltr', // keep number LTR
                  }}
                >
                  <CurrencyIcon size="1.5rem" />
                  <Typography variant="h4" fontWeight="900" color="text.primary" sx={{ lineHeight: 1 }}>
                    {results.monthlyInstallment}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" fontWeight="500">
                    {L.perMonth}
                  </Typography>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', opacity: 0.8 }}>
                  {L.disclaimer}
                </Typography>
              </Box>

              {/* ── Progress bar ── */}
              <Box sx={{ mb: 1.5 }}>
                <Box
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    overflow: 'hidden',
                    display: 'flex',
                    bgcolor: 'grey.100',
                  }}
                >
                  {/* Principal portion (light blue) */}
                  <Box
                    sx={{
                      flexGrow: 1,
                      bgcolor: '#a8d4f5',
                      transition: 'width 0.6s ease',
                    }}
                  />
                  {/* Interest portion (teal) */}
                  <Box
                    sx={{
                      width: `${results.interestRatioPct}%`,
                      bgcolor: '#00a3a3',
                      transition: 'width 0.6s ease',
                    }}
                  />
                </Box>
              </Box>

              {/* ── Legend rows ── */}
              <Stack spacing={0.5} sx={{ mb: 0.5 }}>
                {/* Total financing */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <CurrencyIcon size="0.85em" />
                    <Typography variant="body2" fontWeight="700">
                      {results.totalFinancing}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#a8d4f5', flexShrink: 0 }} />
                    <Typography variant="body2" color="text.secondary">
                      {L.totalFinancingLabel}
                    </Typography>
                  </Box>
                </Box>
                {/* Total interest */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <CurrencyIcon size="0.85em" />
                    <Typography variant="body2" fontWeight="700">
                      {results.totalInterest}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#00a3a3', flexShrink: 0 }} />
                    <Typography variant="body2" color="text.secondary">
                      {L.totalInterestLabel}
                    </Typography>
                  </Box>
                </Box>
              </Stack>

              {/* No down payment note */}
              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 3, textAlign: isRtl ? 'right' : 'left' }}>
                {L.noDownPaymentNote}
              </Typography>

              {/* ── Exemption notice ── */}
              {results.isExempt && (
                <Box
                  sx={{
                    bgcolor: '#e6fffa',
                    border: '1px solid #b2f5ea',
                    borderRadius: 2.5,
                    p: 2,
                    mb: 3,
                  }}
                >
                  <Typography variant="body2" fontWeight="600" textAlign="center" color="#276749">
                    {L.exemptNotice}
                  </Typography>
                </Box>
              )}

              {/* ── Details list ── */}
              <Stack divider={<Divider />}>
                <DetailRow
                  label={L.monthlyIncomeLabel}
                  value={
                    parseFloat(monthlyIncome)
                      ? new Intl.NumberFormat(isRtl ? 'ar-SA' : 'en-US').format(parseFloat(monthlyIncome))
                      : '0'
                  }
                  icon={<CurrencyIcon size="0.85em" />}
                />
                <DetailRow
                  label={L.bankObligationsLabel}
                  value={
                    parseFloat(obligations)
                      ? new Intl.NumberFormat(isRtl ? 'ar-SA' : 'en-US').format(parseFloat(obligations))
                      : '0'
                  }
                  icon={<CurrencyIcon size="0.85em" />}
                />
                <DetailRow label={L.interestRateLabel} value={`%${interestRate}`} />
                <DetailRow label={L.downPaymentPctLabel} value={`%${downPayment}`} />
                <DetailRow
                  label={L.durationLabel}
                  value={`${L.durationUntil}${results.endDateLabel}`}
                />
                {isSupported && (
                  <DetailRow
                    label={L.subsidyLabel}
                    value={`- ${results.subsidyAmount}`}
                    icon={<CurrencyIcon size="0.85em" />}
                  />
                )}
              </Stack>
            </Box>
          )
        )}
      </DialogContent>

      {/* ── Footer buttons ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
          bgcolor: 'background.paper',
        }}
      >
        {viewState === 0 ? (
          <>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{
                px: 4,
                py: 1.25,
                borderRadius: '12px',
                borderColor: 'divider',
                color: 'text.secondary',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': { bgcolor: 'grey.50', borderColor: 'text.secondary' },
              }}
            >
              {L.close}
            </Button>
            <Button
              variant="contained"
              onClick={handleCalculate}
              disabled={!propertyPrice}
              sx={{
                px: 5,
                py: 1.25,
                borderRadius: '12px',
                bgcolor: '#00a3a3',
                color: 'white',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#008a8a', boxShadow: 'none' },
                '&.Mui-disabled': { bgcolor: '#ccc', color: 'white' },
              }}
            >
              {L.calculate}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outlined"
              onClick={() => setViewState(0)}
              sx={{
                px: 4,
                py: 1.25,
                borderRadius: '12px',
                borderColor: 'divider',
                color: 'text.secondary',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': { bgcolor: 'grey.50', borderColor: 'text.secondary' },
              }}
            >
              {L.editData}
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                onClose()
                onBookClick?.()
              }}
              sx={{
                px: 5,
                py: 1.25,
                borderRadius: '12px',
                bgcolor: '#00a3a3',
                color: 'white',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '1rem',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#008a8a', boxShadow: 'none' },
              }}
            >
              {L.bookUnit}
            </Button>
          </>
        )}
      </Box>
    </Dialog>
  )
}
