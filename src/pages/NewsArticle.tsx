import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Box, Container, Typography, Grid, IconButton, Skeleton, Divider } from '@mui/material'
import { ArrowLeft, ArrowRight, Share2, Facebook, Twitter, Youtube, Instagram, Linkedin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getNewsArticle, getNewsArticles } from '../lib/api-client'
import { NewsArticle as NewsArticleType } from '../lib/types'
import { PLACEHOLDER_NEWS_IMAGE } from '../lib/placeholderImages'

const formatDate = (date: Date, isRtl: boolean) => {
  return new Intl.DateTimeFormat(isRtl ? 'ar-SA' : 'en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  }).format(date)
}

export default function NewsArticle() {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'

  const [article, setArticle] = useState<NewsArticleType | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedPosts, setRelatedPosts] = useState<NewsArticleType[]>([])

  useEffect(() => {
    if (!id) return
    window.scrollTo({ top: 0, behavior: 'smooth' })
    const fetchContent = async () => {
      setLoading(true)
      try {
        const res = await getNewsArticle(id)
        if (res.success && res.data) {
          const data = res.data
          const parsedArticle = data.article || (data.articles && data.articles.length > 0 ? data.articles[0] : data)
          setArticle(parsedArticle)
        }
        
        // Fetch related posts (latest 3)
        const relatedRes = await getNewsArticles({ pageSize: 3, sortBy: 'Publication_Date__c', sortOrder: 'DESC' })
        if (relatedRes.success && relatedRes.data && relatedRes.data.articles) {
          // Filter out the current article if it's in the list
          const related = relatedRes.data.articles.filter((a: NewsArticleType) => a.id !== id).slice(0, 3)
          setRelatedPosts(related)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [id])

  const pubDate = article?.publicationDate ? new Date(article.publicationDate) : null

  // Calculate reading time (assuming 200 words per minute)
  const calculateReadingTime = (text: string) => {
    if (!text) return 1
    const words = text.replace(/<[^>]*>?/gm, '').split(/\s+/).length
    return Math.max(1, Math.ceil(words / 200))
  }

  const contentHtml = article?.body || (article as any)?.Body__c || (article as any)?.content || (article as any)?.Content__c || ''
  const readingTime = calculateReadingTime(contentHtml)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title || '',
          url: window.location.href,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert(t('share.copied', 'Copied to clipboard'))
    }
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', pt: 10 }}>
        <Skeleton variant="rectangular" height="60vh" />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Skeleton variant="text" height={60} />
          <Skeleton variant="text" height={40} width="60%" />
          <Box sx={{ mt: 4 }}>
            <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={200} />
          </Box>
        </Container>
      </Box>
    )
  }

  if (!article) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h5">{t('news.notFound', 'Article not found')}</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 12 }}>
      {/* Hero Section */}
      <Box sx={{ position: 'relative', height: '60vh', bgcolor: 'grey.900' }}>
        <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <Box
            component="img"
            src={article.coverImageUrl || PLACEHOLDER_NEWS_IMAGE}
            alt={article.title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              animation: 'continuousZoom 20s infinite alternate ease-in-out',
              '@keyframes continuousZoom': {
                '0%': { transform: 'scale(1)' },
                '100%': { transform: 'scale(1.1)' },
              }
            }}
          />
          {/* Gradient Overlay */}
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)' }} />
        </Box>
        
        {/* Title Box Overlay */}
        <Container maxWidth="lg" sx={{ height: '100%', position: 'relative' }}>
          <Box sx={{
            position: 'absolute',
            bottom: { xs: 0, md: -60 },
            left: { xs: 16, md: 24 },
            right: { xs: 16, md: 'auto' },
            width: { xs: 'auto', md: '70%' },
            bgcolor: 'background.paper',
            p: { xs: 3, md: 6 },
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            zIndex: 10
          }}>
            <Box component={Link} to="/news" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', textDecoration: 'none', mb: 3, '&:hover': { color: 'primary.main' } }}>
              {isRtl ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                {t('news.backToListings', 'BACK TO LISTINGS')}
              </Typography>
            </Box>
            
            <Typography variant="h3" component="h1" sx={{ mb: 4, fontWeight: 300, textTransform: 'uppercase', lineHeight: 1.3 }}>
              {article.title}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 3, color: 'text.secondary' }}>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                {pubDate ? formatDate(pubDate, isRtl) : ''}
              </Typography>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                {t('news.readingTime', 'READING TIME: {{minutes}} MINUTES', { minutes: readingTime })}
              </Typography>
            </Box>
            
            <Box sx={{ position: 'absolute', right: 0, top: '50%', transform: 'translate(50%, -50%)', display: { xs: 'none', md: 'flex' }, bgcolor: 'background.paper', p: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', alignItems: 'center', gap: 2, cursor: 'pointer', '&:hover': { color: 'primary.main' } }} onClick={handleShare}>
              <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 1 }}>{t('news.share', 'SHARE')}</Typography>
              <Share2 size={16} />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Mobile Share */}
      <Container sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'flex-end', mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', cursor: 'pointer' }} onClick={handleShare}>
          <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 1 }}>{t('news.share', 'SHARE')}</Typography>
          <Share2 size={16} />
        </Box>
      </Container>

      {/* Article Body */}
      <Container maxWidth="md" sx={{ mt: { xs: 4, md: 16 } }}>
        <Box 
          sx={{ 
            typography: 'body1',
            lineHeight: 1.8,
            color: 'text.primary',
            '& p': { mb: 3 },
            '& h2, & h3, & h4': { mt: 6, mb: 3, fontWeight: 400 },
            '& img': { maxWidth: '100%', height: 'auto', my: 4, borderRadius: 1 },
            '& ul, & ol': { mb: 3, pl: 3 },
            '& li': { mb: 1 },
            '& blockquote': { borderLeft: '4px solid', borderColor: 'primary.main', pl: 3, py: 1, my: 4, fontStyle: 'italic', color: 'text.secondary', bgcolor: 'rgba(0,0,0,0.02)' }
          }}
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        <Divider sx={{ my: 8 }} />

        {/* Follow Us */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 8 }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>{t('news.followUs', 'Follow Us')}</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton size="small" sx={{ color: 'text.primary', '&:hover': { color: 'primary.main' } }}><Facebook size={20} /></IconButton>
            <IconButton size="small" sx={{ color: 'text.primary', '&:hover': { color: 'primary.main' } }}><Twitter size={20} /></IconButton>
            <IconButton size="small" sx={{ color: 'text.primary', '&:hover': { color: 'primary.main' } }}><Youtube size={20} /></IconButton>
            <IconButton size="small" sx={{ color: 'text.primary', '&:hover': { color: 'primary.main' } }}><Instagram size={20} /></IconButton>
            <IconButton size="small" sx={{ color: 'text.primary', '&:hover': { color: 'primary.main' } }}><Linkedin size={20} /></IconButton>
          </Box>
        </Box>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <Box>
            <Typography variant="h5" sx={{ mb: 4, fontWeight: 300, textTransform: 'uppercase', letterSpacing: 1 }}>{t('news.relatedPosts', 'RELATED POSTS')}</Typography>
            <Grid container spacing={4}>
              {relatedPosts.map((post) => {
                const pDate = post.publicationDate ? new Date(post.publicationDate) : null
                return (
                  <Grid item xs={12} sm={6} md={4} key={post.id}>
                    <Box component={Link} to={`/news/${post.id}`} sx={{ textDecoration: 'none', color: 'inherit', display: 'block', '&:hover img': { transform: 'scale(1.05)' } }}>
                      <Box sx={{ overflow: 'hidden', height: 200, mb: 2 }}>
                        <Box
                          component="img"
                          src={post.coverImageUrl || PLACEHOLDER_NEWS_IMAGE}
                          alt={post.title}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.5s ease',
                          }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {pDate ? formatDate(pDate, isRtl) : ''}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 400, textTransform: 'uppercase', lineHeight: 1.4 }}>
                        {post.title}
                      </Typography>
                    </Box>
                  </Grid>
                )
              })}
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  )
}
