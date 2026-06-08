import { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  IconButton, 
  Dialog,
  Button
} from '@mui/material';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, Move, Map } from 'lucide-react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface InteractiveTopPlanProps {
  imageUrl: string;
}

export default function InteractiveTopPlan({ imageUrl }: InteractiveTopPlanProps) {
  const { t } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.5, 4));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.5, 0.5));
  
  // Reset scale when opening
  useEffect(() => {
    if (isFullscreen) setScale(1);
  }, [isFullscreen]);

  return (
    <>
      <Card
        component={motion.div}
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        sx={{ 
          borderRadius: 4, 
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)', 
          border: '1px solid rgba(255,255,255,0.8)', 
          bgcolor: 'white',
          overflow: 'hidden',
          mb: 4
        }}
      >
        <Box sx={{ position: 'relative', height: 200, overflow: 'hidden', bgcolor: 'grey.100', cursor: 'pointer' }} onClick={() => setIsFullscreen(true)}>
          <Box 
            component="img" 
            src={imageUrl} 
            alt="Master Plan Thumbnail" 
            sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)' } }} 
          />
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)', display: 'flex', alignItems: 'flex-end', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
              <Map size={20} />
              <Typography variant="subtitle1" fontWeight="bold">Master Plan</Typography>
            </Box>
          </Box>
          <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
            <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(4px)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
              <Maximize2 size={16} />
            </IconButton>
          </Box>
        </Box>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Explore the master plan in high resolution. Drag to pan, scroll to zoom.
          </Typography>
          <Button 
            variant="contained" 
            fullWidth 
            onClick={() => setIsFullscreen(true)}
            sx={{ borderRadius: 8, fontWeight: 'bold', display: 'flex', gap: 1 }}
          >
            <Move size={16} />
            Interactive View
          </Button>
        </CardContent>
      </Card>

      <Dialog
        fullScreen
        open={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        PaperProps={{
          sx: { bgcolor: '#1a1a1a', overflow: 'hidden' }
        }}
      >
        {/* Toolbar */}
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          zIndex: 100, 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)',
          pointerEvents: 'none'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'white' }}>
            <Map size={24} />
            <Typography variant="h6" fontWeight="bold">Master Plan Explorer</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, pointerEvents: 'auto' }}>
            <IconButton onClick={handleZoomOut} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
              <ZoomOut size={24} />
            </IconButton>
            <IconButton onClick={handleZoomIn} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
              <ZoomIn size={24} />
            </IconButton>
            <Box sx={{ width: 1, height: 24, bgcolor: 'rgba(255,255,255,0.2)', mx: 1, my: 'auto' }} />
            <IconButton onClick={() => setIsFullscreen(false)} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
              <Minimize2 size={24} />
            </IconButton>
          </Box>
        </Box>

        {/* Interactive Viewer */}
        <Box 
          ref={containerRef}
          sx={{ 
            width: '100vw', 
            height: '100vh', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'grab',
            '&:active': { cursor: 'grabbing' }
          }}
          onWheel={(e) => {
            if (e.deltaY < 0) handleZoomIn();
            else handleZoomOut();
          }}
        >
          <motion.img
            src={imageUrl}
            drag
            dragConstraints={containerRef}
            dragElastic={0.1}
            dragMomentum={false}
            animate={{ scale }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ 
              maxWidth: '90vw', 
              maxHeight: '90vh',
              objectFit: 'contain',
              pointerEvents: 'auto'
            }}
            alt="Interactive Master Plan"
          />
        </Box>
        
        {/* Helper text */}
        <Box sx={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', bgcolor: 'rgba(0,0,0,0.6)', color: 'white', px: 3, py: 1.5, borderRadius: 8, backdropFilter: 'blur(8px)', pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Move size={16} />
          <Typography variant="body2">Drag to explore • Scroll to zoom</Typography>
        </Box>
      </Dialog>
    </>
  );
}
