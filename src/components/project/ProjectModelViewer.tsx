import { useEffect } from 'react'
import { Box, IconButton, Typography, Portal } from '@mui/material'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ProjectBrochureViewer from './ProjectBrochureViewer'
import { isModelImageFile, isModelPdfFile } from '../../lib/projectMedia'

interface ProjectModelViewerProps {
  isOpen: boolean
  onClose: () => void
  url: string | null
  title: string | null
  fileExtension?: string
}

export default function ProjectModelViewer({
  isOpen,
  onClose,
  url,
  title,
  fileExtension,
}: ProjectModelViewerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const isPdf = isModelPdfFile(fileExtension)
  const isImage = isModelImageFile(fileExtension)

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && url && (
          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            sx={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              bgcolor: 'rgba(0,0,0,0.92)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2,
                py: 1.5,
                flexShrink: 0,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {title && (
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                  {title}
                </Typography>
              )}
              <IconButton
                onClick={onClose}
                aria-label="Close"
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                }}
              >
                <X size={24} />
              </IconButton>
            </Box>

            <Box
              sx={{ flex: 1, minHeight: 0, position: 'relative' }}
              onClick={(e) => e.stopPropagation()}
            >
              {isPdf ? (
                <ProjectBrochureViewer pdfUrl={url} />
              ) : isImage ? (
                <Box
                  component={motion.img}
                  src={url}
                  alt={title || ''}
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              ) : (
                <Box
                  component="iframe"
                  src={url}
                  title={title || 'Model file'}
                  sx={{ width: '100%', height: '100%', border: 'none', bgcolor: 'white' }}
                />
              )}
            </Box>
          </Box>
        )}
      </AnimatePresence>
    </Portal>
  )
}
