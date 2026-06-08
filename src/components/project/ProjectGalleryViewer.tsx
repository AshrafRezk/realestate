import { useEffect } from 'react';
import { Box, IconButton, Typography, Portal } from '@mui/material';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectGalleryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  tagText: string | null;
}

export default function ProjectGalleryViewer({
  isOpen,
  onClose,
  imageUrl,
  tagText
}: ProjectGalleryViewerProps) {
  
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && imageUrl && (
          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            sx={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              bgcolor: 'black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            {/* Cinematic Slow-Mo Zoom Out Animation */}
            <Box
              component={motion.img}
              src={imageUrl}
              initial={{ scale: 1.15, filter: 'brightness(0.8)' }}
              animate={{ scale: 1.0, filter: 'brightness(1)' }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{
                scale: { duration: 15, ease: 'easeOut' }, // 15 seconds slow-mo
                filter: { duration: 1.5, ease: 'easeOut' },
                opacity: { duration: 0.5 }
              }}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain', // Change to 'cover' if we want it to fill screen completely
                pointerEvents: 'none' // Don't interfere with clicks
              }}
            />

            {/* Gradient Overlay for Text */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.6) 100%)',
                pointerEvents: 'none'
              }}
            />

            {/* Close Button */}
            <IconButton
              onClick={onClose}
              sx={{
                position: 'absolute',
                top: 24,
                right: 24,
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <X size={28} />
            </IconButton>

            {/* Poetic Tag */}
            {tagText && (
              <Box
                component={motion.div}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                sx={{
                  position: 'absolute',
                  bottom: 48,
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  px: 4
                }}
              >
                <Typography 
                  variant="h3" 
                  sx={{ 
                    color: 'white', 
                    fontWeight: 300,
                    textShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    fontFamily: 'serif'
                  }}
                >
                  {tagText}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </AnimatePresence>
    </Portal>
  );
}
