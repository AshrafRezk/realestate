import { useEffect, useRef } from 'react'

type CountUpOptions = {
  durationMs?: number
  formatter?: (value: number) => string
}

export function useCountUp<T extends HTMLElement = HTMLSpanElement>(targetValue: number, options: CountUpOptions = {}) {
  const { durationMs = 1200, formatter } = options
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    const format = formatter ?? ((v: number) => Math.round(v).toLocaleString())

    const setText = (v: number) => {
      el.textContent = format(v)
    }

    if (reduceMotion || !('IntersectionObserver' in window)) {
      setText(targetValue)
      return
    }

    let rafId: number | null = null
    let started = false

    const run = () => {
      if (started) return
      started = true

      const start = performance.now()
      const from = 0
      const to = targetValue

      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs)
        const eased = 1 - Math.pow(1 - t, 3)
        const current = from + (to - from) * eased
        setText(current)
        if (t < 1) rafId = requestAnimationFrame(tick)
      }

      rafId = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            run()
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
      if (rafId != null) cancelAnimationFrame(rafId)
    }
  }, [targetValue, durationMs, formatter])

  return ref
}

