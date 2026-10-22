'use client'

import React, { useState } from 'react'
import { X, ArrowRight, CheckCircle2, ShoppingBag } from 'lucide-react'
import { Product } from '@/lib/catalog'
import { SIZING_BRACKETS, SizingBracket } from './KidsSizingSection'

interface BikeFinderModalProps {
  isOpen: boolean
  onClose: () => void
  products: Product[]
  onSelectProduct: (product: Product) => void
  onAddToCart: (product: Product) => void
}

export function BikeFinderModal({
  isOpen,
  onClose,
  products,
  onSelectProduct,
  onAddToCart
}: BikeFinderModalProps) {
  // Height slider in cm (default 120cm)
  const [sliderHeight, setSliderHeight] = useState<number>(120)
  // Selected bracket id
  const [activeBracketId, setActiveBracketId] = useState<string>('age-5-9')

  if (!isOpen) return null

  // Determine bracket from slider
  const handleSliderChange = (newVal: number) => {
    setSliderHeight(newVal)
    const match = SIZING_BRACKETS.find((b) => newVal >= b.minCm && newVal <= b.maxCm)
    if (match) {
      setActiveBracketId(match.id)
    } else if (newVal > 152) {
      setActiveBracketId('age-10-15')
    } else {
      setActiveBracketId('under-2')
    }
  }

  // Bracket click
  const handleBracketClick = (bracket: SizingBracket) => {
    setActiveBracketId(bracket.id)
    const mid = Math.round((bracket.minCm + bracket.maxCm) / 2)
    setSliderHeight(mid)
  }

  const activeBracket =
    SIZING_BRACKETS.find((b) => b.id === activeBracketId) || SIZING_BRACKETS[4]

  const recommendedProduct =
    products.find((p) => p.id === activeBracket.recommendedBikeId) ||
    products.find((p) => p.category === 'Kids bikes') ||
    products[3] ||
    products[0]

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="drawer quiz-drawer sizing-guide-modal" onClick={(e) => e.stopPropagation()}>
        {/* Clean Header */}
        <div className="drawer-header sizing-guide-header">
          <div>
            <span className="eyebrow">CYCLE SIZING STUDIO · ADDIS ABABA</span>
            <h2 className="sizing-modal-heading">Buy the bike that actually fits</h2>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close sizing guide">
            <X size={20} />
          </button>
        </div>

        {/* Direct Interactive Sizing View (Tabs completely removed as requested) */}
        <div className="sizing-calculator-view">
          {/* Quick Height Selection Pills matching CycleSouq */}
          <div className="sizing-quick-pills-wrap">
            <label className="quiz-section-title">Select Child Height Range:</label>
            <div className="sizing-pills-grid">
              {SIZING_BRACKETS.map((b) => {
                const isActive = b.id === activeBracket.id
                return (
                  <button
                    key={b.id}
                    type="button"
                    className={`sizing-pill-btn ${isActive ? 'is-active' : ''}`}
                    onClick={() => handleBracketClick(b)}
                  >
                    <strong className="pill-title">{b.label}</strong>
                    <span className="pill-sub">{b.ageGroup}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Continuous Height Slider */}
          <div className="sizing-slider-card">
            <div className="slider-label-row">
              <span>Fine-tune height:</span>
              <strong className="slider-height-value">
                {sliderHeight} cm <small>({(sliderHeight / 2.54).toFixed(1)} inches)</small>
              </strong>
            </div>
            <input
              type="range"
              min={70}
              max={180}
              value={sliderHeight}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="sizing-range-slider"
              aria-label="Child height slider"
            />
            <div className="slider-ticks-row">
              <span>70 cm (Toddler)</span>
              <span>100 cm</span>
              <span>125 cm</span>
              <span>150 cm</span>
              <span>180 cm (Adult)</span>
            </div>
          </div>

          {/* Real-time 4-Metric Readout Box */}
          <div className="sizing-readout-grid">
            <div className="readout-card">
              <span className="readout-label">Wheel Size</span>
              <strong className="readout-val">{activeBracket.wheelSize}</strong>
              <small className="readout-sub">Optimal roll-over</small>
            </div>

            <div className="readout-card">
              <span className="readout-label">Standover Height</span>
              <strong className="readout-val">{activeBracket.standover}</strong>
              <small className="readout-sub">Clearance: {activeBracket.standoverInches}</small>
            </div>

            <div className="readout-card">
              <span className="readout-label">Child Inseam</span>
              <strong className="readout-val">{activeBracket.approxInseam}</strong>
              <small className="readout-sub">Ground to crotch</small>
            </div>

            <div className="readout-card">
              <span className="readout-label">Target Rider</span>
              <strong className="readout-val">{activeBracket.ageGroup}</strong>
              <small className="readout-sub">Growth calibrated</small>
            </div>
          </div>

          {/* Live Recommendation Display */}
          {recommendedProduct && (
            <div className="quiz-recommendation-card">
              <div className="rec-badge-strip">
                <span className="rec-badge">CALIBRATED FIT</span>
                <span className="rec-wheel-spec">{activeBracket.wheelSize}</span>
              </div>

              <div className="rec-product-row">
                <div className="rec-thumb">
                  <img
                    src={recommendedProduct.images[0]}
                    alt={recommendedProduct.name}
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = '/hero-bike.webp'
                    }}
                  />
                </div>
                <div className="rec-info">
                  <small className="rec-brand">{recommendedProduct.brand} · {recommendedProduct.category}</small>
                  <h4>{recommendedProduct.name}</h4>
                  <strong className="rec-price">{recommendedProduct.priceFormatted}</strong>
                </div>
              </div>

              <p className="rec-reason">
                <CheckCircle2 size={15} className="inline-icon" /> {activeBracket.whyItFits}
              </p>

              <div className="rec-actions">
                <button
                  className="button button-dark btn-sm full-width"
                  onClick={() => {
                    onAddToCart(recommendedProduct)
                    onClose()
                  }}
                >
                  <ShoppingBag size={14} /> Add to Bag
                </button>
                <button
                  className="button button-outline btn-sm full-width"
                  onClick={() => {
                    onSelectProduct(recommendedProduct)
                    onClose()
                  }}
                >
                  View Full Specs <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
