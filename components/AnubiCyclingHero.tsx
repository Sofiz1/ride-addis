'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import gsap from 'gsap'
import { Product } from '@/lib/catalog'
import { CloudDivider } from '@/components/CloudDivider'

interface AnubiCyclingHeroProps {
  products: Product[]
  onSelectProduct: (product: Product) => void
  onOpenBikeFinder?: () => void
  isAm?: boolean
}

interface MultiColorTrailPoint {
  x: number
  y: number
  age: number
  maxAge: number
  radius: number
  color: string
}

// Ultra-lightweight WebP cutouts (~75KB each, 10x smaller, preloaded in head for 0ms lag!)
const DISTINCT_BIKE_PHOTOS = [
  '/bike-mtb.webp',
  '/bike-road.webp',
  '/bike-city.webp',
  '/bike-kids.webp',
  '/bike-mtb.webp',
  '/bike-road.webp',
  '/bike-city.webp',
  '/bike-kids.webp'
]

// Clean White Studio Card Backdrops for rotating bicycle exhibits
const BIKE_FINISHES = [
  { 
    bg: '#ffffff', 
    shadowColor: 'rgba(0,0,0,0.28)',
    borderColor: 'rgba(255, 255, 255, 0.95)',
    filter: 'none'
  },
  { 
    bg: '#ffffff', 
    shadowColor: 'rgba(0,0,0,0.28)',
    borderColor: 'rgba(255, 255, 255, 0.95)',
    filter: 'none'
  },
  { 
    bg: '#ffffff', 
    shadowColor: 'rgba(0,0,0,0.28)',
    borderColor: 'rgba(255, 255, 255, 0.95)',
    filter: 'none'
  },
  { 
    bg: '#ffffff', 
    shadowColor: 'rgba(0,0,0,0.28)',
    borderColor: 'rgba(255, 255, 255, 0.95)',
    filter: 'none'
  },
  { 
    bg: '#ffffff', 
    shadowColor: 'rgba(0,0,0,0.28)',
    borderColor: 'rgba(255, 255, 255, 0.95)',
    filter: 'none'
  },
  { 
    bg: '#ffffff', 
    shadowColor: 'rgba(0,0,0,0.28)',
    borderColor: 'rgba(255, 255, 255, 0.95)',
    filter: 'none'
  },
  { 
    bg: '#ffffff', 
    shadowColor: 'rgba(0,0,0,0.28)',
    borderColor: 'rgba(255, 255, 255, 0.95)',
    filter: 'none'
  },
  { 
    bg: '#ffffff', 
    shadowColor: 'rgba(0,0,0,0.28)',
    borderColor: 'rgba(255, 255, 255, 0.95)',
    filter: 'none'
  }
]

// Vibrant multi-color trail palette (strictly adhering to no blue & no purple)
const MULTI_TRAIL_COLORS = [
  '#f76707', // Warm sunset orange
  '#f59f00', // Solar gold / amber
  '#2b8a3e', // Entoto highland emerald
  '#e8590c', // Terracotta warm
  '#d9480f', // Chili flame red
  '#fab005', // Radiant amber
  '#40c057', // Vivid meadow green
  '#fd7e14'  // Tangerine blaze
]


// Instant pre-calculated initial styling for instant SSR paint (ZERO delay on refresh!)
function getInitialBikeStyle(idx: number, total: number) {
  const baseAngle = (idx * 2 * Math.PI) / total
  const rx = 36
  const ry = 28
  const tiltFactor = -0.05
  const x = Math.cos(baseAngle) * rx
  const y = Math.sin(baseAngle) * ry + Math.cos(baseAngle) * rx * tiltFactor
  const depth = (Math.sin(baseAngle) + 1) / 2
  const scale = 0.42 + depth * 0.78
  const opacity = 0.35 + depth * 0.65
  const zIndex = Math.round(10 + depth * 25)
  const tiltDeg = (-Math.cos(baseAngle) * 10).toFixed(1)

  return {
    left: `calc(50% + ${x.toFixed(2)}%)`,
    top: `calc(37% + ${y.toFixed(2)}%)`,
    transform: `translate3d(-50%, -50%, 0) scale(${scale.toFixed(3)}) rotate(${tiltDeg}deg)`,
    opacity: `${opacity.toFixed(2)}`,
    zIndex
  }
}

export function AnubiCyclingHero({
  products,
  onSelectProduct
}: AnubiCyclingHeroProps) {
  const containerRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  
  // Independent word refs for separate 3D banking and tilting
  const rideWordRef = useRef<HTMLSpanElement>(null)
  const addisWordRef = useRef<HTMLSpanElement>(null)

  // Sofonias Hagos Magnetic Character Nodes (9 characters: R-I-D-E A-D-D-I-S)
  const charNodesRef = useRef<(HTMLSpanElement | null)[]>([])
  const mousePosRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false })

  // Orbital physics in refs for 120fps hardware acceleration with ZERO shaking or React state re-renders
  const angleRef = useRef<number>(0)
  const isDraggingRef = useRef<boolean>(false)
  const dragStartXRef = useRef<number>(0)
  const dragStartAngleRef = useRef<number>(0)
  const hoveredCardRef = useRef<string | null>(null)

  // React state for hover title only
  const [hoveredBike, setHoveredBike] = useState<Product | null>(null)

  // Interactive Cursor Multi-Color Drawing Trail
  const pointsRef = useRef<MultiColorTrailPoint[]>([])
  const colorCounterRef = useRef<number>(0)

  // 8 flagship bicycles for the orbital ring
  const orbitalBikes = React.useMemo(() => {
    const bikes = products.filter((p) => p.section === 'bike')
    return bikes.slice(0, 8)
  }, [products])

  // Canvas resize & Interactive Multi-Color Drawing Trail Loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number

    const resizeCanvas = () => {
      if (!containerRef.current || !canvas) return
      const rect = containerRef.current.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Render loop for multi-color cursor pattern
    const renderPattern = () => {
      if (!canvas || !ctx || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      const pts = pointsRef.current

      // Age points
      for (let i = 0; i < pts.length; i++) {
        pts[i].age += 1
      }
      pointsRef.current = pts.filter((p) => p.age < p.maxAge)

      // Draw multi-colored ribbons and glowing sparks
      if (pts.length > 1) {
        ctx.save()
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        for (let j = 0; j < pts.length - 1; j++) {
          const p1 = pts[j]
          const p2 = pts[j + 1]
          const life = 1 - p1.age / p1.maxAge

          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)

          // Multi-color gradient between trail points
          const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y)
          grad.addColorStop(0, p1.color)
          grad.addColorStop(1, p2.color)

          ctx.globalAlpha = life * 0.75
          ctx.strokeStyle = grad
          ctx.lineWidth = Math.max(1.2, life * p1.radius * 2)
          ctx.stroke()

          // Colorful particle embers
          if (j % 3 === 0) {
            ctx.beginPath()
            ctx.arc(p1.x, p1.y, Math.max(0.7, life * 2.8), 0, Math.PI * 2)
            ctx.fillStyle = p1.color
            ctx.globalAlpha = life * 0.85
            ctx.fill()
          }
        }
        ctx.restore()
      }

      animId = requestAnimationFrame(renderPattern)
    }

    animId = requestAnimationFrame(renderPattern)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animId)
    }
  }, [])





  // Butter-Smooth Orbital Animation Loop - Dynamic, Silky Continuous Rotation
  useEffect(() => {
    let animId: number
    let lastTime = performance.now()
    let cardNodes = stageRef.current?.querySelectorAll<HTMLElement>('.anubi-float-bike')

    const updateOrbit = (time: number) => {
      const delta = Math.min((time - lastTime) / 1000, 0.04)
      lastTime = time

      // Continuous orbital rotation glide when not dragging
      if (!isDraggingRef.current && !hoveredCardRef.current) {
        // Silky, noticeable continuous rotation (~0.32 rad/s = full orbit every ~19.6s)
        angleRef.current = (angleRef.current + 0.32 * delta) % (Math.PI * 2)
      }

      if (!cardNodes || cardNodes.length === 0) {
        cardNodes = stageRef.current?.querySelectorAll<HTMLElement>('.anubi-float-bike')
      }

      const currentAngle = angleRef.current
      const isMob = window.innerWidth < 780
      const isSmallMob = window.innerWidth < 480
      const total = orbitalBikes.length

      const centerY = isSmallMob ? 33 : isMob ? 34 : 37
      const rx = isSmallMob ? 45 : isMob ? 42 : 36
      const ry = isSmallMob ? 33 : isMob ? 31 : 28
      const tiltFactor = isMob ? -0.02 : -0.05

      if (cardNodes && cardNodes.length > 0) {
        cardNodes.forEach((node, idx) => {
          const baseAngle = (idx * 2 * Math.PI) / total
          const phi = baseAngle + currentAngle

          const x = Math.cos(phi) * rx
          const y = Math.sin(phi) * ry + Math.cos(phi) * rx * tiltFactor

          const depth = (Math.sin(phi) + 1) / 2
          const scale = isSmallMob 
            ? 0.38 + depth * 0.44 
            : isMob 
              ? 0.42 + depth * 0.52 
              : 0.42 + depth * 0.78
          const opacity = 0.35 + depth * 0.65
          const zIndex = Math.round(10 + depth * 25)
          const tiltDeg = (-Math.cos(phi) * 10).toFixed(1)

          // Direct GPU translate3d: ZERO JITTER, SILKY SMOOTH
          node.style.left = `calc(50% + ${x.toFixed(2)}%)`
          node.style.top = `calc(${centerY}% + ${y.toFixed(2)}%)`
          node.style.transform = `translate3d(-50%, -50%, 0) scale(${scale.toFixed(3)}) rotate(${tiltDeg}deg)`
          node.style.opacity = `${opacity.toFixed(2)}`
          node.style.zIndex = `${zIndex}`

          if (depth > 0.88) {
            node.setAttribute('data-front', 'true')
          } else {
            node.removeAttribute('data-front')
          }
        })
      }

      animId = requestAnimationFrame(updateOrbit)
    }

    animId = requestAnimationFrame(updateOrbit)
    return () => cancelAnimationFrame(animId)
  }, [orbitalBikes.length])

  // SEPARATE INDEPENDENT WORD MOVEMENT ON HOVER
  const handleWordPointerMove = useCallback((e: React.MouseEvent<HTMLElement>, word: 'RIDE' | 'ADDIS') => {
    const currentWordEl = word === 'RIDE' ? rideWordRef.current : addisWordRef.current
    const otherWordEl = word === 'RIDE' ? addisWordRef.current : rideWordRef.current

    if (currentWordEl) {
      const r = currentWordEl.getBoundingClientRect()
      const nx = ((e.clientX - r.left) / r.width - 0.5) * 2
      const ny = ((e.clientY - r.top) / r.height - 0.5) * 2
      // Active hovered word moves independently (banks, elevates, rotates)
      currentWordEl.style.transform = `perspective(700px) rotateX(${-ny * 16}deg) rotateY(${nx * 20}deg) translateY(-8px) scale(1.08)`
    }
    if (otherWordEl) {
      // The other word reacts separately with a distinct counter-angle
      const r = currentWordEl ? currentWordEl.getBoundingClientRect() : null
      if (r) {
        const nx = ((e.clientX - r.left) / r.width - 0.5) * 2
        const ny = ((e.clientY - r.top) / r.height - 0.5) * 2
        otherWordEl.style.transform = `perspective(700px) rotateX(${ny * 6}deg) rotateY(${-nx * 8}deg) translateY(3px) scale(0.96)`
      }
    }
  }, [])

  const handleWordPointerLeave = useCallback(() => {
    if (rideWordRef.current) {
      rideWordRef.current.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)'
    }
    if (addisWordRef.current) {
      addisWordRef.current.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)'
    }
  }, [])

  // SOFONIAS HAGOS SIGNATURE KINETIC 3D CHARACTER ENGINE (EXACT REPLICATION FROM sofonias-hagos.vercel.app)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const ctx = gsap.context(() => {
      const chars = gsap.utils.toArray<HTMLElement>('.sofonias-char')
      if (!chars || chars.length === 0) return

      // 1. Entrance animation (3D random dispersion to clean alignment)
      gsap.fromTo(
        chars,
        {
          opacity: 0,
          y: 50,
          z: () => gsap.utils.random(-350, 350),
          rotationX: () => gsap.utils.random(-140, 140),
          rotationY: () => gsap.utils.random(-140, 140),
          filter: 'blur(12px)'
        },
        {
          opacity: 1,
          y: 0,
          z: 0,
          rotationX: 0,
          rotationY: 0,
          filter: 'blur(0px)',
          stagger: { each: 0.04, from: 'random' },
          duration: 1.6,
          ease: 'expo.out',
          delay: 0.15
        }
      )

      // 2. Individual character hover interaction (random 3D pop, rotation, and cycling luminous glow)
      chars.forEach((char) => {
        const hoverTween = gsap.to(char, {
          z: () => gsap.utils.random(40, 85),
          scale: () => gsap.utils.random(1.25, 1.7),
          rotationX: () => gsap.utils.random(-35, 35),
          rotationY: () => gsap.utils.random(-35, 35),
          color: () => gsap.utils.random(['#f76707', '#fab005', '#fd7e14', '#ff922b', '#ffd43b', '#ffffff']),
          textShadow: '0 0 28px rgba(247, 103, 7, 0.95), 0 0 54px rgba(245, 159, 0, 0.75), 0 4px 12px rgba(0,0,0,0.95)',
          duration: 0.3,
          ease: 'power2.out',
          paused: true
        })

        const onEnter = () => {
          hoverTween.play()
        }

        const onLeave = () => {
          hoverTween.reverse()
        }

        char.addEventListener('mouseenter', onEnter)
        char.addEventListener('mouseleave', onLeave)
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  // Mouse Move: Draw dynamic multi-color pattern, update 3D camera parallax, & handle drag
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    // Feed mouse coordinates to magnetic character physics engine
    mousePosRef.current = { x: e.clientX, y: e.clientY, active: true }

    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const clientX = e.clientX - rect.left
    const clientY = e.clientY - rect.top

    // Cycle through vibrant non-blue, non-purple colors
    colorCounterRef.current = (colorCounterRef.current + 1) % MULTI_TRAIL_COLORS.length
    const nextColor = MULTI_TRAIL_COLORS[colorCounterRef.current]

    // Add point to cursor trail pattern
    pointsRef.current.push({
      x: clientX,
      y: clientY,
      age: 0,
      maxAge: 32,
      radius: Math.random() * 2 + 2,
      color: nextColor
    })

    // Dragging physics
    if (isDraggingRef.current) {
      const deltaX = e.clientX - dragStartXRef.current
      angleRef.current = dragStartAngleRef.current - deltaX * 0.0055
    }
  }, [])

  const handleDragStart = (clientX: number) => {
    isDraggingRef.current = true
    dragStartXRef.current = clientX
    dragStartAngleRef.current = angleRef.current
  }

  const handleDragEnd = () => {
    isDraggingRef.current = false
  }

  return (
    <section
      id="top"
      ref={containerRef}
      className="anubi-hero cycle-hd-hero"
      onPointerMove={handlePointerMove}
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest('button, a, .sofonias-brand-h1, .sofonias-word-span, .hero-brand-split-row')) return
        handleDragStart(e.clientX)
      }}
      onPointerUp={handleDragEnd}
      onPointerLeave={() => {
        handleDragEnd()
        mousePosRef.current.active = false
      }}
      aria-label="Ride Addis Bicycle Showroom"
    >
      {/* 1. STATIC HD MOUNTAIN ROAD BACKGROUND SCENE (NO MOVEMENT, NO 3D) */}
      <div className="hero-static-bg-container" aria-hidden="true">
        <img
          src="/hero-cyclist-bg.jpg?v=road"
          alt="Road cyclist riding along scenic mountain highway at golden hour"
          className="hero-static-hd-img"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />

        {/* Golden hour atmospheric mountain haze */}
        <div className="hero-mountain-haze" />

        {/* Deep cinematic vignette & contrast grading */}
        <div className="hero-cinematic-vignette" />




      </div>

      {/* 2. Dynamic Multi-Color Drawing Canvas Trail */}
      <canvas ref={canvasRef} className="hero-pattern-canvas" aria-hidden="true" />



      {/* 4. Subtle Elevation Contour Rings */}
      <div className="anubi-grid-canvas">
        <div className="anubi-contour-ring ring-outer" />
        <div className="anubi-contour-ring ring-mid" />
        <div className="anubi-contour-ring ring-inner" />
      </div>

      {/* 5. 3D Orbital Stage with instant pre-calculated SSR positions */}
      <div ref={stageRef} className="anubi-orbit-stage">
        {orbitalBikes.map((bike, idx) => {
          const isHovered = hoveredBike?.id === bike.id
          const finish = BIKE_FINISHES[idx % BIKE_FINISHES.length]
          const photoUrl = DISTINCT_BIKE_PHOTOS[idx % DISTINCT_BIKE_PHOTOS.length]
          const initialStyle = getInitialBikeStyle(idx, orbitalBikes.length)

          return (
            <div
              key={bike.id}
              className={`anubi-float-bike ${isHovered ? 'is-hovered' : ''}`}
              style={initialStyle}
              onMouseEnter={() => {
                hoveredCardRef.current = bike.id
                setHoveredBike(bike)
              }}
              onMouseLeave={() => {
                hoveredCardRef.current = null
                setHoveredBike(null)
              }}
              onClick={() => onSelectProduct(bike)}
              role="button"
              tabIndex={0}
              aria-label={`View ${bike.name}`}
            >
              {/* Ultra-lightweight WebP bike on non-white studio backdrop */}
              <div
                className="anubi-bike-photo-wrapper"
                style={{
                  background: finish.bg,
                  borderColor: finish.borderColor
                }}
              >
                <img
                  src={photoUrl}
                  alt={bike.name}
                  className="anubi-bike-photo"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  style={{ filter: finish.filter }}
                />
                <div
                  className="anubi-bike-shadow"
                  style={{ background: `radial-gradient(ellipse at center, ${finish.shadowColor} 0%, transparent 72%)` }}
                />
              </div>

              {/* Title Box that appears only on hover */}
              <div className="anubi-hover-title-box">
                <div className="hover-title-info">
                  <strong className="hover-bike-name">{bike.name}</strong>
                  <span className="hover-bike-price">{bike.priceFormatted}</span>
                </div>
                <div className="hover-title-arrow" aria-hidden="true">
                  <ArrowUpRight size={14} />
                </div>
              </div>
            </div>
          )
        })}

        {/* HERO MIDDLE: SOFONIAS HAGOS KINETIC 3D HEADING & SHOP NOW */}
        <div className="hero-copy-centered hero-name-only-mode">
          <div className="hero-brand-split-row">
            <h1 className="sofonias-brand-h1" aria-label="RIDE ADDIS">
              <div className="sofonias-kinetic-wrapper" style={{ perspective: '1200px' }}>
                {/* WORD 1: RIDE (Top line) */}
                <span
                  ref={rideWordRef}
                  className="sofonias-word-span"
                  onMouseMove={(e) => handleWordPointerMove(e, 'RIDE')}
                  onMouseLeave={handleWordPointerLeave}
                  tabIndex={0}
                  aria-label="RIDE"
                >
                  {['R', 'I', 'D', 'E'].map((char, i) => (
                    <span
                      key={`ride-${char}-${i}`}
                      ref={(el) => { charNodesRef.current[i] = el }}
                      className="sofonias-char"
                    >
                      {char}
                    </span>
                  ))}
                </span>

                {/* WORD 2: ADDIS (Bottom line) */}
                <span
                  ref={addisWordRef}
                  className="sofonias-word-span"
                  onMouseMove={(e) => handleWordPointerMove(e, 'ADDIS')}
                  onMouseLeave={handleWordPointerLeave}
                  tabIndex={0}
                  aria-label="ADDIS"
                >
                  {['A', 'D', 'D', 'I', 'S'].map((char, i) => (
                    <span
                      key={`addis-${char}-${i}`}
                      ref={(el) => { charNodesRef.current[4 + i] = el }}
                      className="sofonias-char"
                    >
                      {char}
                    </span>
                  ))}
                </span>
              </div>
            </h1>
          </div>

          {/* High-Conversion SHOP NOW Button */}
          <a
            className="hero-shop-now-btn"
            href="#bikes"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="shop-btn-text">SHOP NOW</span>
            <span className="shop-btn-arrow" aria-hidden="true">
              <ArrowRight size={13} />
            </span>
          </a>
        </div>
      </div>

      {/* Clean bottom Cloud Shape Divider */}
      <CloudDivider fill="#f4f2ed" position="bottom" />
    </section>
  )
}
