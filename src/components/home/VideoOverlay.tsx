import { Box } from '@mui/material'
import { motion } from 'framer-motion'

/**
 * Animated dark overlay with floating particles for video background
 */
const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5,
  }))


const rnd=Math.random();
export default function VideoOverlay() {
  // Generate random positions for animated particles
  

  return (
    <Box
       sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 3,
        pointerEvents: 'none',
        // Lighter overlay gradient for better video visibility
        // Using multiple layers for better coverage
        background: [
          'linear-gradient(to bottom, rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.35))',
          'radial-gradient(circle at center, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.2))',
        ].join(', '),
      }}
    >
      {/* Animated floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(1px)',
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, rnd * 20 - 10, 0],
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
      
      {/* Additional animated gradient orbs */}
      <motion.div
        style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, -20, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />
    </Box>
  )
}

