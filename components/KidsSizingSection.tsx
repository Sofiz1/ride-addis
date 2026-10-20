'use client'

import React, { useState } from 'react'
import { Ruler, CheckCircle2, ArrowRight, ShoppingBag, BookOpen, Info, ShieldCheck, Sparkles } from 'lucide-react'
import { Product } from '@/lib/catalog'

export interface SizingBracket {
  id: string
  label: string            // "Up to 90cm", "76 - 96cm", "91 - 101cm", "101 - 122cm", "106 - 132cm", "122 - 152cm", "160cm+"
  ageGroup: string         // "Under 2 years", "2 - 3 years", "3 - 4 years", "4 - 7 years", "5 - 9 years", "7 - 13 years", "10 - 15 years"
  wheelSize: string        // e.g. 10" - 12", 12", 14", 16", 20", 24", 26" - 29"
  standover: string        // "35 - 40 cm", "38 - 45 cm", etc.
  standoverInches: string  // '14" - 16"', etc.
  approxInseam: string     // "30 - 38 cm", etc.
  minCm: number
  maxCm: number
  typicalRider: string
  recommendedBikeName: string
  recommendedBikeId: string
  whyItFits: string
}

export const SIZING_BRACKETS: SizingBracket[] = [
  {
    id: 'under-2',
    label: 'Up to 90cm',
    ageGroup: 'Under 2 years',
    wheelSize: '10"-12" Balance',
    standover: '35 - 40 cm',
    standoverInches: '14"-16"',
    approxInseam: '30 - 38 cm',
    minCm: 70,
    maxCm: 90,
    typicalRider: 'Toddlers developing balance and motor coordination without training wheels',
    recommendedBikeName: 'Lalibela Mini Balance 12',
    recommendedBikeId: 'bike-04',
    whyItFits: 'Ultra-low step-through standover lets toddlers plant both feet firmly on the ground for instant confidence and balance.'
  },
  {
    id: 'age-2-3',
    label: '76 - 96cm',
    ageGroup: 'Ages 2 - 3',
    wheelSize: '12" Wheel',
    standover: '38 - 45 cm',
    standoverInches: '15"-18"',
    approxInseam: '35 - 43 cm',
    minCm: 76,
    maxCm: 96,
    typicalRider: 'First-time riders transitioning from balance bikes to first pedal strokes',
    recommendedBikeName: 'Lalibela First Pedal 12',
    recommendedBikeId: 'bike-04',
    whyItFits: 'Short-reach brake levers and an upright handlebar posture prevent strain and give complete steering control.'
  },
  {
    id: 'age-3-4',
    label: '91 - 101cm',
    ageGroup: 'Ages 3 - 4',
    wheelSize: '14" Wheel',
    standover: '42 - 48 cm',
    standoverInches: '16.5"-19"',
    approxInseam: '40 - 47 cm',
    minCm: 91,
    maxCm: 101,
    typicalRider: 'Preschool riders gaining pedaling speed on paved paths and sidewalks',
    recommendedBikeName: 'Addis Junior 14 Alloy',
    recommendedBikeId: 'bike-04',
    whyItFits: 'Featherlight aluminum frame with enclosed chainguard and calibrated crank length for efficient pedaling.'
  },
  {
    id: 'age-4-7',
    label: '101 - 122cm',
    ageGroup: 'Ages 4 - 7',
    wheelSize: '16" Wheel',
    standover: '48 - 55 cm',
    standoverInches: '19"-21.5"',
    approxInseam: '45 - 54 cm',
    minCm: 101,
    maxCm: 122,
    typicalRider: 'Confident young riders cruising neighborhood streets and family bike paths',
    recommendedBikeName: 'Lalibela Junior 16',
    recommendedBikeId: 'bike-04',
    whyItFits: 'Optimized bottom bracket height allows comfortable straddling at stoplights with ample standover clearance.'
  },
  {
    id: 'age-5-9',
    label: '106 - 132cm',
    ageGroup: 'Ages 5 - 9',
    wheelSize: '20" Junior Wheelset',
    standover: '54 - 62 cm',
    standoverInches: '21.5"-24.5"',
    approxInseam: '52 - 61 cm',
    minCm: 106,
    maxCm: 132,
    typicalRider: 'Elementary school riders tackling varied terrain and longer family rides',
    recommendedBikeName: 'Lalibela Mini 20"',
    recommendedBikeId: 'bike-04',
    whyItFits: 'In Stock! 6-Speed Shimano twist shift and Kenda junior multi-surface tires engineered for Addis Ababa neighborhood exploration.'
  },
  {
    id: 'age-7-13',
    label: '122 - 152cm',
    ageGroup: 'Ages 7 - 13',
    wheelSize: '24" Wheelset',
    standover: '60 - 70 cm',
    standoverInches: '24"-27.5"',
    approxInseam: '58 - 69 cm',
    minCm: 122,
    maxCm: 152,
    typicalRider: 'Youth riders building endurance, climbing local hills, and weekend trail riding',
    recommendedBikeName: 'Entoto Youth 24 Trail',
    recommendedBikeId: 'bike-02',
    whyItFits: 'Front suspension fork and wide-range cassette give young riders full hill-climbing power on Entoto elevation.'
  },
  {
    id: 'age-10-15',
    label: '160cm+',
    ageGroup: 'Ages 10 - 15 / Adult',
    wheelSize: '26"-29" Pro Wheelset',
    standover: '72+ cm',
    standoverInches: '28"+',
    approxInseam: '70+ cm',
    minCm: 160,
    maxCm: 195,
    typicalRider: 'Teens and adult riders commuting across Addis Ababa or racing road & trails',
    recommendedBikeName: 'Addis Commuter 01 / Entoto Trail S',
    recommendedBikeId: 'bike-01',
    whyItFits: 'Full-size adult geometry with hydraulic disc brakes, high-torque drivetrain, and puncture-resistant tires for capital streets.'
  }
]

interface KidsSizingSectionProps {
  products: Product[]
  onOpenSizingGuide: () => void
  onSelectProduct: (product: Product) => void
  onAddToCart: (product: Product) => void
  onFilterCategory?: (category: string) => void
}

export function KidsSizingSection({
  products,
  onOpenSizingGuide,
  onSelectProduct,
  onAddToCart,
  onFilterCategory
}: KidsSizingSectionProps) {
  // Default to 106 - 132cm (Ages 5 - 9, matches Lalibela Mini 20)
  const [selectedId, setSelectedId] = useState<string>('age-5-9')

  const activeBracket = SIZING_BRACKETS.find((b) => b.id === selectedId) || SIZING_BRACKETS[4]

  // Find live product in catalog
  const matchingProduct =
    products.find((p) => p.id === activeBracket.recommendedBikeId) ||
    products.find((p) => p.category === 'Kids bikes') ||
    products[3] ||
    products[0]

  return (
    <div className="cyclesouq-fit-section">
      <div className="cyclesouq-fit-header">
        <p className="eyebrow">FIND MY BIKE · KIDS & RIDER SIZING</p>
        <h2 className="cyclesouq-fit-title">Buy the bike that actually fits</h2>
      </div>

      {/* 7 Exact CycleSouq Height Range Pills */}
      <div className="cyclesouq-height-pills-row" role="tablist" aria-label="Child Height Ranges">
        {SIZING_BRACKETS.map((bracket) => {
          const isActive = bracket.id === selectedId
          return (
            <button
              key={bracket.id}
              role="tab"
              aria-selected={isActive}
              className={`cyclesouq-height-pill ${isActive ? 'is-active' : ''}`}
              onClick={() => setSelectedId(bracket.id)}
            >
              <span className="pill-height-range">{bracket.label}</span>
              <small className="pill-age-sub">{bracket.ageGroup}</small>
            </button>
          )
        })}
      </div>

      {/* Dynamic Sizing Result & Matching Bike Card */}
      <div className="cyclesouq-fit-result-card">
        <div className="fit-result-metrics-grid">
          <div className="fit-metric-box">
            <span className="metric-label">Recommended Wheel</span>
            <strong className="metric-value">{activeBracket.wheelSize}</strong>
            <small className="metric-hint">Optimal rolling diameter</small>
          </div>

          <div className="fit-metric-box">
            <span className="metric-label">Standover Height</span>
            <strong className="metric-value">{activeBracket.standover}</strong>
            <small className="metric-hint">Clearance: {activeBracket.standoverInches}</small>
          </div>

          <div className="fit-metric-box">
            <span className="metric-label">Child Inseam</span>
            <strong className="metric-value">{activeBracket.approxInseam}</strong>
            <small className="metric-hint">Floor to crotch length</small>
          </div>

          <div className="fit-metric-box">
            <span className="metric-label">Age Target</span>
            <strong className="metric-value">{activeBracket.ageGroup}</strong>
            <small className="metric-hint">Calibrated geometry</small>
          </div>
        </div>

        {/* Live Matching Bike from Ride Addis Store */}
        {matchingProduct && (
          <div className="fit-product-preview-row">
            <div className="fit-bike-image-box">
              <img
                src={matchingProduct.images[0]}
                alt={matchingProduct.name}
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = '/hero-bike.png'
                }}
              />
              <span className="fit-verified-pill">
                <CheckCircle2 size={11} /> 100% Fit Guarantee
              </span>
            </div>

            <div className="fit-bike-details">
              <span className="fit-bike-category">{matchingProduct.brand} · {matchingProduct.category}</span>
              <h3 className="fit-bike-name">{matchingProduct.name}</h3>
              <p className="fit-bike-fit-reason">{activeBracket.whyItFits}</p>

              <div className="fit-bike-price-line">
                <span className="fit-bike-price">{matchingProduct.priceFormatted}</span>
                <span className="fit-bike-stock-badge">In Stock in Addis Ababa</span>
              </div>

              <div className="fit-action-btns">
                <button
                  className="button button-dark fit-cta-btn"
                  onClick={() => onAddToCart(matchingProduct)}
                >
                  <ShoppingBag size={14} /> Add to Bag
                </button>
                <button
                  className="button button-outline fit-specs-btn"
                  onClick={() => onSelectProduct(matchingProduct)}
                >
                  View Full Specs <ArrowRight size={13} />
                </button>
                {onFilterCategory && (
                  <button
                    className="fit-view-all-link"
                    onClick={() => onFilterCategory('Kids bikes')}
                  >
                    Explore all {activeBracket.label} models
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CycleSouq CTA Link to Open the Complete Sizing Guide */}
      <div className="cyclesouq-guide-cta-row">
        <button
          className="cyclesouq-open-guide-btn"
          onClick={onOpenSizingGuide}
        >
          <BookOpen size={16} />
          <span>Open the kids' sizing guide</span>
          <ArrowRight size={14} />
        </button>
        <span className="guide-cta-sub">
          Includes comprehensive comparison chart, measurement instructions, and standover height diagrams.
        </span>
      </div>
    </div>
  )
}
