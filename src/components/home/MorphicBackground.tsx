import { useEffect, useState } from 'react'
import { Box } from '@mui/material'
import { motion, useSpring } from 'framer-motion'

export default function MorphicBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isClicked, setIsClicked] = useState(false)
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false)

  // Highly smooth spring-physics values for cursor tracking
  const springX = useSpring(0, { stiffness: 50, damping: 20 })
  const springY = useSpring(0, { stiffness: 50, damping: 20 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize position from -0.5 to 0.5 relative to screen center
      const x = (e.clientX / window.innerWidth) - 0.5
      const y = (e.clientY / window.innerHeight) - 0.5
      setMousePos({ x: e.clientX, y: e.clientY })
      springX.set(x * 100) // translates up to 50px
      springY.set(y * 100)
    }

    const triggerVibration = (pattern: number | number[]) => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(pattern)
        } catch (err) {
          // Ignore vibration policy/unsupported errors silently
        }
      }
    }

    const handleClick = () => {
      // Click haptics: Vibration burst + background animation subtle change (ripple/pulse trigger)
      triggerVibration([15])
      setIsClicked(true)
      setTimeout(() => setIsClicked(false), 400)
    }

    const handlePointerOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isInteractive = target.closest('button, a, input, [role="button"], .MuiButtonBase-root, .MuiCard-root')
      if (isInteractive) {
        if (!isHoveringInteractive) {
          setIsHoveringInteractive(true)
          // Cursor haptics: subtle vibration on cursor interactive hover
          triggerVibration(5)
        }
      } else {
        setIsHoveringInteractive(false)
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('click', handleClick, { passive: true })
    window.addEventListener('mouseover', handlePointerOver, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
      window.removeEventListener('mouseover', handlePointerOver)
    }
  }, [springX, springY, isHoveringInteractive])

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0, // Behind all content
        overflow: 'hidden',
      }}
    >
      {/* Dynamic Morphic Blob 1 - Top Right */}
      <motion.div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '60vw',
          height: '60vw',
          maxWidth: '800px',
          maxHeight: '800px',
          borderRadius: '40% 60% 60% 40% / 50% 30% 70% 50%',
          background: 'radial-gradient(circle, rgba(16, 45, 74, 0.08) 0%, rgba(207, 222, 235, 0.12) 60%, transparent 100%)',
          filter: 'blur(60px)',
          x: springX,
          y: springY,
        }}
        animate={{
          scale: isClicked ? 1.15 : (isHoveringInteractive ? 1.05 : 1),
          rotate: [0, 180, 360],
          borderRadius: [
            '40% 60% 60% 40% / 50% 30% 70% 50%',
            '60% 40% 50% 50% / 30% 60% 40% 70%',
            '40% 60% 60% 40% / 50% 30% 70% 50%'
          ]
        }}
        transition={{
          rotate: { repeat: Infinity, duration: 25, ease: 'linear' },
          borderRadius: { repeat: Infinity, duration: 15, ease: 'easeInOut' },
          scale: { duration: 0.4, ease: 'easeOut' }
        }}
      />

      {/* Dynamic Morphic Blob 2 - Bottom Left */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: '-15%',
          left: '-10%',
          width: '70vw',
          height: '70vw',
          maxWidth: '900px',
          maxHeight: '900px',
          borderRadius: '50% 50% 30% 70% / 60% 40% 60% 40%',
          background: 'radial-gradient(circle, rgba(207, 180, 235, 0.06) 0%, rgba(16, 45, 74, 0.09) 70%, transparent 100%)',
          filter: 'blur(70px)',
          // Opposite spring translation for depth
          x: useSpring(0, { stiffness: 40, damping: 25 }),
          y: useSpring(0, { stiffness: 40, damping: 25 }),
        }}
        animate={{
          scale: isClicked ? 1.2 : (isHoveringInteractive ? 1.08 : 1),
          rotate: [360, 180, 0],
          borderRadius: [
            '50% 50% 30% 70% / 60% 40% 60% 40%',
            '30% 70% 70% 30% / 40% 60% 40% 60%',
            '50% 50% 30% 70% / 60% 40% 60% 40%'
          ]
        }}
        transition={{
          rotate: { repeat: Infinity, duration: 30, ease: 'linear' },
          borderRadius: { repeat: Infinity, duration: 20, ease: 'easeInOut' },
          scale: { duration: 0.4, ease: 'easeOut' }
        }}
      />

      {/* Subtle cursor tracking subtle background ripple ring triggered on clicks */}
      {isClicked && (
        <motion.div
          initial={{ opacity: 0.4, scale: 0 }}
          animate={{ opacity: 0, scale: 4 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: mousePos.x - 50,
            top: mousePos.y - 50,
            width: 100,
            height: 100,
            borderRadius: '50%',
            border: '2px solid rgba(16, 45, 74, 0.25)',
            background: 'radial-gradient(circle, rgba(16, 45, 74, 0.1) 0%, transparent 70%)',
          }}
        />
      )}

      {/* Ambient overlay subtle tint modification on cursor interactions */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(16, 45, 74, 0.02)',
        }}
        animate={{
          opacity: isHoveringInteractive ? 0.8 : 0.3,
          background: isClicked ? 'rgba(16, 45, 74, 0.05)' : 'rgba(16, 45, 74, 0.02)',
        }}
        transition={{ duration: 0.3 }}
      />
    </Box>
  )
}
