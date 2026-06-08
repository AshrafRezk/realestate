import { useEffect, useState, useRef } from 'react'
import { Box, Typography, TextField, Button, InputAdornment } from '@mui/material'
import { motion } from 'framer-motion'
import { ChevronDown, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { getFeaturedVideo, detectVideoAspectRatio } from '../../lib/api-client'
import VideoCover from './VideoCover'

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void
      }
    }
  }
}

interface FeaturedVideo {
  projectId: string
  projectName: string
  projectNameAr: string
  videoUrl: string
  coverImageUrl: string
  aspectRatio?: number
}

export default function HeroSection() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [featuredVideo, setFeaturedVideo] = useState<FeaturedVideo | null>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [instagramEmbedFailed, setInstagramEmbedFailed] = useState(false)
  const [showFallback, setShowFallback] = useState(true)
  const [aspectRatio, setAspectRatio] = useState<number>(4 / 5)
  const [searchQuery, setSearchQuery] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    async function loadFeaturedVideo() {
      try {
        const response = await getFeaturedVideo()
        if (response.success && response.data) {
          if (response.data.videoUrl) {
            let finalAspectRatio = response.data.aspectRatio
            if (finalAspectRatio) {
              setAspectRatio(finalAspectRatio)
            } else {
              const isNativeVideo = /\.(mp4|webm|ogg|m3u8|mov|avi)(\?|$)/i.test(response.data.videoUrl) ||
                                    response.data.videoUrl.startsWith('blob:') ||
                                    response.data.videoUrl.startsWith('data:video/')
              if (isNativeVideo) {
                try {
                  const detectedRatio = await detectVideoAspectRatio(response.data.videoUrl)
                  if (detectedRatio) {
                    finalAspectRatio = detectedRatio
                    setAspectRatio(detectedRatio)
                  }
                } catch (error) {
                  setAspectRatio(4 / 5)
                }
              } else {
                if (response.data.videoUrl.includes('instagram.com/reel/')) {
                  setAspectRatio(9 / 16)
                } else if (response.data.videoUrl.includes('instagram.com/p/')) {
                  setAspectRatio(1)
                } else {
                  setAspectRatio(4 / 5)
                }
              }
            }
            setFeaturedVideo({ ...response.data, aspectRatio: finalAspectRatio })
            setIsVideoPlaying(true)
          }
        }
      } catch (error) {
        console.error('Error loading featured video:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadFeaturedVideo()
  }, [])

  useEffect(() => {
    if (featuredVideo?.videoUrl?.includes('instagram.com')) {
      setInstagramEmbedFailed(false)
      if (window.instgrm) {
        window.instgrm.Embeds.process()
        return
      }
      const script = document.createElement('script')
      script.src = 'https://www.instagram.com/embed.js'
      script.async = true
      script.onload = () => {
        setTimeout(() => {
          if (window.instgrm) {
            window.instgrm.Embeds.process()
          } else {
            setInstagramEmbedFailed(true)
          }
        }, 100)
      }
      script.onerror = () => setInstagramEmbedFailed(true)
      const timeout = setTimeout(() => {
        if (!window.instgrm) setInstagramEmbedFailed(true)
      }, 3000)
      document.body.appendChild(script)
      return () => {
        clearTimeout(timeout)
        const existingScript = document.querySelector('script[src="https://www.instagram.com/embed.js"]')
        if (existingScript && existingScript.parentNode) {
          existingScript.parentNode.removeChild(existingScript)
        }
      }
    }
  }, [featuredVideo])

  const scrollToProjects = () => {
    const target = document.getElementById('inspiring-spaces')
    if (!target) return
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset
    const startPosition = window.pageYOffset
    const distance = targetPosition - startPosition
    const duration = 1500
    let start: number | null = null
    const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    const animation = (currentTime: number) => {
      if (start === null) start = currentTime
      const timeElapsed = currentTime - start
      const progress = Math.min(timeElapsed / duration, 1)
      const ease = easeInOutCubic(progress)
      window.scrollTo(0, startPosition + distance * ease)
      if (timeElapsed < duration) {
        requestAnimationFrame(animation)
      }
    }
    requestAnimationFrame(animation)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/search')
    }
  }

  const renderBackgroundVideo = () => {
    if (!featuredVideo || !featuredVideo.videoUrl || isLoading) {
      if (featuredVideo?.coverImageUrl) {
        return (
          <Box
            sx={{
              position: 'absolute', inset: 0,
              background: `url(${featuredVideo.coverImageUrl}) center/cover`,
            }}
          />
        )
      }
      return (
        <video
          autoPlay
          muted
          playsInline
          loop
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        >
          <source src="/my-hero-video.mp4" type="video/mp4" />
        </video>
      )
    }

    if (featuredVideo.videoUrl.includes('instagram.com')) {
      if (instagramEmbedFailed) {
        return (
          <Box
            sx={{
              position: 'absolute', inset: 0,
              background: featuredVideo.coverImageUrl ? `url(${featuredVideo.coverImageUrl}) center/cover` : '#e2e8f0',
            }}
          />
        )
      }
      return (
        <Box
          component="blockquote"
          className="instagram-media"
          data-instgrm-permalink={featuredVideo.videoUrl}
          data-instgrm-version="14"
          sx={{ position: 'absolute', inset: 0, m: 0, p: 0, '& iframe': { width: '100% !important', height: '100% !important', border: 'none' } }}
        />
      )
    }

    const isNativeVideo = /\.(mp4|webm|ogg|m3u8|mov|avi)(\?|$)/i.test(featuredVideo.videoUrl) ||
                          featuredVideo.videoUrl.startsWith('blob:') ||
                          featuredVideo.videoUrl.startsWith('data:video/')

    if (isNativeVideo) {
      return (
        <video
          ref={videoRef}
          src={featuredVideo.videoUrl}
          autoPlay
          muted
          loop
          playsInline
          onLoadedMetadata={() => {
            if (videoRef.current && videoRef.current.videoWidth && videoRef.current.videoHeight) {
              const detectedRatio = videoRef.current.videoWidth / videoRef.current.videoHeight
              if (Math.abs(detectedRatio - aspectRatio) > 0.01) {
                setAspectRatio(detectedRatio)
              }
            }
            setIsVideoPlaying(true)
          }}
          onPlay={() => setIsVideoPlaying(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )
    }

    let finalIframeUrl = featuredVideo.videoUrl.trim()
    const separator = finalIframeUrl.includes('?') ? '&' : '?'
    if (!finalIframeUrl.includes('autoplay=')) {
      finalIframeUrl += `${separator}autoplay=1&mute=1&playsinline=1`
    }
    if (finalIframeUrl.includes('youtube.com') || finalIframeUrl.includes('youtu.be')) {
      if (!finalIframeUrl.includes('controls=')) {
        finalIframeUrl += '&controls=0'
      }
      if (!finalIframeUrl.includes('loop=')) {
        finalIframeUrl += '&loop=1'
      }
    }
    return (
      <Box
        component="iframe"
        src={finalIframeUrl}
        onLoad={() => setTimeout(() => setIsVideoPlaying(true), 500)}
        sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        loading="eager"
      />
    )
  }

  return (
    <Box sx={{ position: 'relative', height: '100vh', minHeight: 700, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Background Video/Image */}
      {renderBackgroundVideo()}

      {/* Dark Overlay */}
      <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0, 0, 0, 0.35)', zIndex: 2 }} />

      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 3, textAlign: 'center', px: { xs: 2, md: 4 }, maxWidth: 900, mx: 'auto', width: '100%' }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <Typography
            variant="h1"
            sx={{
              color: '#ffffff',
              mb: { xs: 2, md: 3 },
            }}
          >
            Find your sanctuary in the dunes
          </Typography>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              bgcolor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(12px)',
              p: { xs: 2, sm: 3 },
              maxWidth: 700,
              mx: 'auto',
              borderRadius: { xs: 3, md: 4 },
              overflow: 'hidden',
            }}
          >
            <TextField
              placeholder="Search by city, neighborhood, or building..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="standard"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} color="#003527" />
                    </InputAdornment>
                  ),
                  disableUnderline: true,
                  sx: { px: 1, py: 1.5, fontSize: '1rem', color: '#191c1e' },
                },
              }}
              sx={{ '& .MuiInputBase-root': { bgcolor: 'transparent', borderRadius: { xs: 3, md: 4 } } }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: '#d4af37',
                color: '#003527',
                px: 5,
                py: 1.5,
                whiteSpace: 'nowrap',
                borderRadius: { xs: 3, md: 4 },
                '&:hover': { bgcolor: '#e9c349' },
              }}
            >
              EXPLORE NOW
            </Button>
          </Box>
        </motion.div>
      </Box>

      {/* Scroll Down */}
      <Box
        onClick={scrollToProjects}
        sx={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', zIndex: 3, cursor: 'pointer', color: 'white' }}
      >
        <motion.span animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }} style={{ display: 'inline-block' }}>
          <ChevronDown size={32} />
        </motion.span>
      </Box>
    </Box>
  )
}
