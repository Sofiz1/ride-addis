'use client'

import React, { useEffect, useRef, useState } from 'react'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  /** Animation variant */
  animation?: 'fade-up' | 'fade-left' | 'fade-right' | 'scale-up' | 'fade-in' | 'blur-in'
  /** Stagger delay in ms (for grid items) */
  delay?: number
  /** IntersectionObserver threshold (0-1) */
  threshold?: number
  /** Once revealed, stay revealed */
  once?: boolean
}

export function ScrollReveal({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
  threshold = 0.15,
  once = true
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true)
      return
    }

    // Safety fallback: ensure content is revealed even on slow mobile scrolling or horizontal carousels
    const fallbackTimer = setTimeout(() => {
      setIsVisible(true)
    }, 800)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          clearTimeout(fallbackTimer)
          if (once) observer.unobserve(el)
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin: '0px 0px -20px 0px' }
    )

    observer.observe(el)
    return () => {
      clearTimeout(fallbackTimer)
      observer.disconnect()
    }
  }, [threshold, once])

  return (
    <div
      ref={ref}
      className={`scroll-reveal scroll-${animation} ${isVisible ? 'is-revealed' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
