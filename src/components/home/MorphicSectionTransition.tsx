import { Box } from '@mui/material'
import { motion } from 'framer-motion'

interface MorphicSectionTransitionProps {
  type?: 'wave' | 'curve' | 'glow'
  color?: string
  height?: number | string
  flip?: boolean
}

export default function MorphicSectionTransition({
  type = 'wave',
  color = 'rgba(255, 255, 255, 0.4)',
  height = 80,
  flip = false,
}: MorphicSectionTransitionProps) {
  if (type === 'glow') {
    return (
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', my: -2, position: 'relative', zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0.3, scaleX: 0.8 }}
          whileInView={{ opacity: 0.8, scaleX: 1 }}
          transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          style={{
            width: '80%',
            height: '4px',
            background: `radial-gradient(ellipse at center, ${color} 0%, transparent 80%)`,
            filter: 'blur(2px)',
          }}
        />
      </Box>
    )
  }

  // Wavy Morphic SVG path transitioning continuously
  return (
    <Box
      sx={{
        width: '100%',
        height: height,
        overflow: 'hidden',
        lineHeight: 0,
        position: 'relative',
        zIndex: 1,
        transform: flip ? 'rotate(180deg)' : 'none',
        mt: flip ? 0 : -1,
        mb: flip ? -1 : 0,
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        sx={{
          position: 'relative',
          display: 'block',
          width: 'calc(100% + 1.3px)',
          height: '100%',
        }}
      >
        <motion.path
          d="M0,0 C150,90 350,-40 500,40 C650,120 900,10 1200,40 L1200,120 L0,120 Z"
          fill={color}
          animate={{
            d: [
              "M0,0 C150,90 350,-40 500,40 C650,120 900,10 1200,40 L1200,120 L0,120 Z",
              "M0,0 C200,30 400,100 600,20 C800,-60 1000,80 1200,20 L1200,120 L0,120 Z",
              "M0,0 C150,90 350,-40 500,40 C650,120 900,10 1200,40 L1200,120 L0,120 Z"
            ]
          }}
          transition={{
            repeat: Infinity,
            duration: 12,
            ease: "easeInOut"
          }}
        />
      </Box>
    </Box>
  )
}
