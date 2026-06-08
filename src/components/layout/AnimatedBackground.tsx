import { motion } from 'framer-motion'
import { Box } from '@mui/material'
import { useEffect, useState } from 'react'

const auroraColors = [
  'hsl(var(--aurora-1))',
  'hsl(var(--aurora-2))',
  'hsl(var(--aurora-3))',
  'hsl(var(--aurora-4))',
]

interface AnimatedBackgroundProps {
  variant?: 'blobs' | 'geometric'
}

export default function AnimatedBackground({ variant = 'blobs' }: AnimatedBackgroundProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: -10,
        overflow: 'hidden',
        perspective: '1000px',
        background: variant === 'geometric' 
          ? 'linear-gradient(to bottom, #ffffff, #f0f4f8)' 
          : 'linear-gradient(to bottom right, hsl(var(--background)), #ffffff)',
      }}
    >
      {variant === 'geometric' ? (
        // Geometric Variant - Soft, large overlapping shapes like the screenshot
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: '#f4f7fb' }}>
          {Array.from({ length: 5 }).map((_, i) => {
            const width = 600 + Math.random() * 400
            const height = 600 + Math.random() * 400
            const colors = ['#799fbc', '#9dc2e1', '#aab6be', '#ffffff']
            const color1 = colors[i % colors.length]
            const color2 = colors[(i + 1) % colors.length]
            
            return (
              <motion.div
                key={`geo-${i}`}
                animate={{
                  x: [`${Math.random() * 80 - 10}vw`, `${Math.random() * 80 - 10}vw`],
                  y: [`${Math.random() * 80 - 10}vh`, `${Math.random() * 80 - 10}vh`],
                  rotate: [Math.random() * 20, Math.random() * 40 - 20],
                }}
                transition={{
                  duration: 60 + Math.random() * 40,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'linear',
                }}
                style={{
                  position: 'absolute',
                  width,
                  height,
                  background: `linear-gradient(135deg, ${color1}88 0%, ${color2}44 100%)`,
                  backdropFilter: 'blur(20px)',
                  clipPath: 'polygon(0% 15%, 15% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%)',
                  boxShadow: '0 20px 60px rgba(16, 45, 74, 0.05), inset 0 0 0 1px rgba(255,255,255,0.6)',
                  border: `1px solid ${color1}44`,
                }}
              />
            )
          })}
        </Box>
      ) : (
        // Blobs Variant
        Array.from({ length: 6 }).map((_, i) => {
          const size = 300 + Math.random() * 200
          return (
            <motion.div
              key={`blob-${i}`}
              animate={{
                x: [`${Math.random() * 100 - 20}vw`, `${Math.random() * 100 - 20}vw`, `${Math.random() * 100 - 20}vw`],
                y: [`${Math.random() * 100 - 20}vh`, `${Math.random() * 100 - 20}vh`, `${Math.random() * 100 - 20}vh`],
                rotate: [0, 180, 360],
                scale: [1, 1.2, 1],
                borderRadius: ['30%', '50%', '40%'],
              }}
              transition={{
                duration: 25 + Math.random() * 15,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'linear',
              }}
              style={{
                position: 'absolute',
                width: size,
                height: size,
                background: auroraColors[i % auroraColors.length],
                opacity: 0.5,
                filter: 'blur(80px)',
                mixBlendMode: 'multiply',
              }}
            />
          )
        })
      )}
    </Box>
  )
}
