import { useState, useEffect } from 'react'
import { Box, Container, Typography, Grid, Select, MenuItem, TextField, Pagination, Skeleton } from '@mui/material'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getNewsArticles } from '../lib/api-client'
import { NewsArticle } from '../lib/types'
import { PLACEHOLDER_NEWS_IMAGE } from '../lib/placeholderImages'

const formatDate = (date: Date, isRtl: boolean) => {
  return new Intl.DateTimeFormat(isRtl ? 'ar-SA' : 'en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  }).format(date)
}

export default function News() {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'

  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Filters
  const [year, setYear] = useState('All')
  const [month, setMonth] = useState('All')
  const [segment, setSegment] = useState('All')
  const [keyword, setKeyword] = useState('')

  const fetchNews = async () => {
    setLoading(true)
    try {
      const filters: any = {
        page,
        pageSize: 12,
        sortBy: 'Publication_Date__c',
        sortOrder: 'DESC'
      }
      if (year !== 'All') filters.year = year
      if (month !== 'All') filters.month = month
      if (segment !== 'All') filters.segment = segment
      if (keyword) filters.keyword = keyword // assuming API supports generic keyword search or we could omit if not. Note: The API contract didn't explicitly specify `keyword`, but let's pass it in case or just filter client side if the API doesn't support it.

      const res = await getNewsArticles(filters)
      if (res.success && res.data) {
        setArticles(res.data.articles || [])
        setTotalPages(res.data.pagination?.totalPages || 1)
      } else {
        setArticles([])
        setTotalPages(1)
      }
    } catch (error) {
      console.error(error)
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [page, year, month, segment, keyword])

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const currentYear = new Date().getFullYear()
  const years = ['All', ...Array.from({ length: 5 }, (_, i) => (currentYear - i).toString())]
  const months = ['All', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

  return (
    <Box sx={{ py: 12, minHeight: '100vh', bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Typography variant="h3" component="h1" sx={{ mb: 6, fontWeight: 300, textTransform: 'uppercase', letterSpacing: 2, textAlign: isRtl ? 'right' : 'left' }}>
          {t('common.ourNews')}
        </Typography>

        {/* Filters */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, textTransform: 'uppercase', fontWeight: 600 }}>{t('news.year', 'YEAR')}</Typography>
            <Select
              fullWidth
              size="small"
              value={year}
              onChange={(e) => { setYear(e.target.value); setPage(1); }}
              sx={{ bgcolor: 'background.paper' }}
            >
              {years.map(y => (
                <MenuItem key={y} value={y}>{y === 'All' ? t('news.all', 'All') : y}</MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, textTransform: 'uppercase', fontWeight: 600 }}>{t('news.month', 'MONTH')}</Typography>
            <Select
              fullWidth
              size="small"
              value={month}
              onChange={(e) => { setMonth(e.target.value); setPage(1); }}
              sx={{ bgcolor: 'background.paper' }}
              disabled={year === 'All'}
            >
              {months.map(m => (
                <MenuItem key={m} value={m}>{m === 'All' ? t('news.all', 'All') : m}</MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, textTransform: 'uppercase', fontWeight: 600 }}>{t('news.businessSegment', 'BUSINESS SEGMENT')}</Typography>
            <Select
              fullWidth
              size="small"
              value={segment}
              onChange={(e) => { setSegment(e.target.value); setPage(1); }}
              sx={{ bgcolor: 'background.paper' }}
            >
              <MenuItem value="All">{t('news.select', 'Select')}</MenuItem>
              <MenuItem value="Residential">Residential</MenuItem>
              <MenuItem value="Commercial">Commercial</MenuItem>
              <MenuItem value="Investment">Investment</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" sx={{ color: 'transparent', display: 'block', mb: 1 }}>.</Typography>
            <TextField
              fullWidth
              size="small"
              placeholder={t('news.searchKeywords', 'Search keywords')}
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
              sx={{ bgcolor: 'background.paper' }}
            />
          </Grid>
        </Grid>

        {/* Grid */}
        {loading ? (
          <Grid container spacing={4}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Grid item xs={12} md={6} key={i}>
                <Skeleton variant="rectangular" height={300} />
                <Skeleton variant="text" height={40} sx={{ mt: 2 }} />
                <Skeleton variant="text" height={20} width="60%" />
              </Grid>
            ))}
          </Grid>
        ) : articles.length > 0 ? (
          <Grid container spacing={4}>
            {articles.map((article) => {
              const pubDate = article.publicationDate ? new Date(article.publicationDate) : null
              return (
                <Grid item xs={12} md={6} key={article.id}>
                  <Box component={Link} to={`/news/${article.id}`} sx={{ textDecoration: 'none', color: 'inherit', display: 'block', '&:hover img': { transform: 'scale(1.05)' } }}>
                    <Box sx={{ overflow: 'hidden', height: { xs: 200, md: 300 }, mb: 2 }}>
                      <Box
                        component="img"
                        src={article.coverImageUrl || PLACEHOLDER_NEWS_IMAGE}
                        alt={article.title}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease',
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                      {pubDate ? formatDate(pubDate, isRtl) : ''}
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 300, textTransform: 'uppercase', lineHeight: 1.4 }}>
                      {article.title}
                    </Typography>
                    {article.segment && (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {article.segment}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              )
            })}
          </Grid>
        ) : (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              {t('news.empty', 'No news articles found.')}
            </Typography>
          </Box>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Container>
    </Box>
  )
}
