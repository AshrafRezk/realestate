import { useEffect, useRef } from 'react'

export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const rootRef = useRef<T | null>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    const targets = Array.from(root.querySelectorAll<HTMLElement>('.reveal'))

    if (reduceMotion) {
      for (const el of targets) el.classList.add('is-visible')
      return
    }

    if (!('IntersectionObserver' in window)) {
      for (const el of targets) el.classList.add('is-visible')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            ;(entry.target as HTMLElement).classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12 }
    )

    for (const el of targets) observer.observe(el)

    return () => observer.disconnect()
  }, [])

  return rootRef
}

