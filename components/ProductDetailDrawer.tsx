'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { X, Heart, ShoppingBag, ArrowRight, ShieldCheck, Check, Truck } from 'lucide-react'
import { Product, ProductSizeOption } from '@/lib/catalog'

interface ProductDetailDrawerProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (product: Product, size?: string) => void
  isSaved: boolean
  onToggleSave: () => void
  language: 'EN' | 'አማ'
}

export function ProductDetailDrawer({
  product,
  isOpen,
  onClose,
  onAddToCart,
  isSaved,
  onToggleSave,
  language
}: ProductDetailDrawerProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)

  // Derive available size options based on product.sizes or fallback for bikes
  const availableSizes: ProductSizeOption[] = useMemo(() => {
    if (!product) return []
    if (product.sizes && product.sizes.length > 0) {
      return product.sizes
    }
    // Fallback if sizes array was not explicitly populated
    if (product.section === 'bike') {
      const isKids = (product.category || '').toLowerCase().includes('kids')
      if (isKids) {
        return [
          { size: '12" Wheel', heightCm: '76 - 96 cm', price: Math.max(0, product.price - 4000) },
          { size: '16" Wheel', heightCm: '101 - 122 cm', price: product.price },
          { size: '20" Wheel', heightCm: '106 - 132 cm', price: product.price + 4000 }
        ]
      }
      return [
        { size: 'Small', heightCm: '155 - 170 cm', price: Math.max(0, product.price - 3000) },
        { size: 'Medium', heightCm: '168 - 182 cm', price: product.price },
        { size: 'Large', heightCm: '180 - 195 cm', price: product.price + 3000 }
      ]
    }
    return []
  }, [product])

  const [selectedSize, setSelectedSize] = useState<string>('')

  // Sync selected size whenever product changes or drawer opens
  useEffect(() => {
    if (availableSizes.length > 0) {
      setSelectedSize(availableSizes[0].size)
    } else {
      setSelectedSize('')
    }
    setSelectedPhotoIndex(0)
  }, [product?.id, availableSizes])

  if (!isOpen || !product) return null

  // Active size and price
  const currentOption = availableSizes.find(s => s.size === selectedSize) || availableSizes[0]
  const activePrice = currentOption ? currentOption.price : product.price

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="drawer product-drawer" onClick={(e) => e.stopPropagation()}>
        <button className="drawer-close" onClick={onClose} aria-label="Close product details">
          <X size={20} />
        </button>

        {/* Scrollable Body: Photos, Description, and Specs */}
        <div className="product-drawer-scrollable">
          {/* Multi-Photo Gallery in Drawer */}
          <div className="drawer-gallery">
            <div className="drawer-main-photo-box">
              <img
                src={product.images[selectedPhotoIndex] || product.images[0]}
                alt={product.name}
                className="drawer-hero-photo"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = '/hero-bike.webp'
                }}
              />
              <button
                className={`drawer-heart-btn ${isSaved ? 'is-saved' : ''}`}
                onClick={onToggleSave}
                aria-label="Save to favorites"
              >
                <Heart fill={isSaved ? '#d9bd6a' : 'none'} color={isSaved ? '#d9bd6a' : '#171817'} size={18} />
              </button>
            </div>

            {/* Multiple Photo Thumbnails */}
            {product.images.length > 1 && (
              <div className="drawer-thumb-strip">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`drawer-thumb-btn ${selectedPhotoIndex === idx ? 'active' : ''}`}
                    onClick={() => setSelectedPhotoIndex(idx)}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = '/hero-bike.webp'
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="drawer-body-info">
            <div className="category-brand-line">
              <span className="eyebrow">{product.brand} · {product.category}</span>
              {product.badge && <span className="mini-badge-pill">{product.badge}</span>}
            </div>

            <h2>{language === 'አማ' ? product.am : product.name}</h2>
            <p className="drawer-type">{product.type}</p>

            {/* Luxury Price & Value Guarantee Hero Display */}
            <div className="drawer-price-card">
              <div className="price-top-meta">
                <span className="price-status-pill">IN STOCK · READY TO RIDE</span>
                <span className="price-vat-tag">VAT & CALIBRATION INCLUDED</span>
              </div>
              <div className="price-main-display">
                <span className="currency-symbol">ETB</span>
                <span className="price-amount">{activePrice.toLocaleString()}</span>
                <span className="currency-note">
                  {currentOption ? `${currentOption.size.toUpperCase()} FRAME · IN ADDIS` : 'PRICE IN ADDIS'}
                </span>
              </div>
              <div className="price-perks-row">
                <span className="perk-item">
                  <ShieldCheck size={13} className="perk-icon" /> Official Warranty
                </span>
                <span className="perk-dot">·</span>
                <span className="perk-item">
                  <Check size={13} className="perk-icon" /> Free Workshop Tuning
                </span>
                <span className="perk-dot">·</span>
                <span className="perk-item">
                  <Truck size={13} className="perk-icon" /> Express Van Delivery
                </span>
              </div>
            </div>

            <p className="drawer-description">
              {language === 'አማ' ? product.amDescription : product.description} Tested on Addis Ababa elevation and road conditions, with initial workshop setup and complimentary biometric fit check included.
            </p>

            {/* Dynamic Size Selector: Shows ONLY sizes configured for this product */}
            {availableSizes.length > 0 && (
              <div className="drawer-size-selector">
                <div className="size-selector-header flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider block">
                    {availableSizes.length === 1 ? 'Available Frame Size:' : 'Select Rider Frame Size & Price:'}
                  </label>
                  {availableSizes.length === 1 && (
                    <span className="text-[10px] bg-amber-500/15 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wider">
                      {availableSizes[0].size} Only
                    </span>
                  )}
                </div>
                <div className="size-pill-group flex flex-wrap gap-2 mb-2">
                  {availableSizes.map((szOpt) => {
                    const isSelected = selectedSize === szOpt.size
                    return (
                      <button
                        key={szOpt.size}
                        type="button"
                        className={`size-pill size-pill-detailed ${
                          isSelected
                            ? 'active !bg-[#171817] !text-white !border-[#d9bd6a] ring-2 ring-[#d9bd6a]/80 shadow-[0_4px_16px_rgba(0,0,0,0.3)]'
                            : 'bg-white/90 text-neutral-900 border-neutral-300 hover:border-[#b9a15d] hover:bg-white'
                        }`}
                        onClick={() => setSelectedSize(szOpt.size)}
                        aria-pressed={isSelected}
                      >
                        <span className={`size-pill-name font-bold block ${isSelected ? '!text-white' : 'text-neutral-900'}`}>
                          {szOpt.size}
                        </span>
                        {szOpt.heightCm && (
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border block my-1 ${
                              isSelected
                                ? 'bg-amber-400/20 !text-amber-300 border-amber-400/40'
                                : 'text-amber-800 bg-amber-500/10 border-amber-500/20'
                            }`}
                          >
                            📏 {szOpt.heightCm}
                          </span>
                        )}
                        <span
                          className={`size-pill-price text-[10px] font-mono block ${
                            isSelected ? '!text-[#f3e5ab] font-bold' : 'text-neutral-700 opacity-90'
                          }`}
                        >
                          ETB {szOpt.price.toLocaleString()}
                        </span>
                      </button>
                    )
                  })}
                </div>
                <small className="size-hint text-xs text-neutral-500 block">
                  Selected: <strong className="text-neutral-900">{currentOption?.size}</strong>
                  {currentOption?.heightCm && (
                    <span className="text-amber-700 font-semibold ml-1.5">
                      · Fits Rider: {currentOption.heightCm}
                    </span>
                  )}
                  {' · '}
                  <span className="font-mono font-bold text-amber-700">ETB {activePrice.toLocaleString()}</span>
                </small>
              </div>
            )}

            {/* Specs Highlights */}
            {product.specs && (
              <div className="specs-table-box">
                <h4>Engineering Specifications & Sizing</h4>
                <div className="specs-grid">
                  {product.specs.recommendedHeight && (
                    <div className="col-span-2 bg-amber-500/10 border border-amber-500/25 p-2.5 rounded-xl">
                      <small className="text-amber-900 font-bold tracking-wider">RECOMMENDED RIDER HEIGHT</small>
                      <span className="text-sm font-black text-neutral-950 flex items-center gap-1.5 mt-0.5">
                        📏 {product.specs.recommendedHeight}
                      </span>
                    </div>
                  )}
                  {product.specs.frame && (
                    <div>
                      <small>FRAME</small>
                      <span>{product.specs.frame}</span>
                    </div>
                  )}
                  {product.specs.gears && (
                    <div>
                      <small>DRIVETRAIN</small>
                      <span>{product.specs.gears}</span>
                    </div>
                  )}
                  {product.specs.brakes && (
                    <div>
                      <small>BRAKES</small>
                      <span>{product.specs.brakes}</span>
                    </div>
                  )}
                  {product.specs.weight && (
                    <div>
                      <small>TOTAL WEIGHT</small>
                      <span>{product.specs.weight}</span>
                    </div>
                  )}
                  {product.specs.wheels && (
                    <div>
                      <small>WHEELSET</small>
                      <span>{product.specs.wheels}</span>
                    </div>
                  )}
                  {product.specs.warranty && (
                    <div>
                      <small>WARRANTY</small>
                      <span>{product.specs.warranty}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pinned Bottom Action Footer: ALWAYS visible on PC and mobile phones */}
        <div className="product-drawer-pinned-footer">
          <div className="pinned-footer-inner">
            <div className="pinned-price-box">
              <small className="pinned-price-label">
                {currentOption ? `${currentOption.size.toUpperCase()} TOTAL` : 'TOTAL PRICE'}
              </small>
              <div className="pinned-price-amount">
                <span className="pinned-cur">ETB</span>
                <strong className="pinned-val">{activePrice.toLocaleString()}</strong>
              </div>
            </div>
            <button
              className="button button-dark add-to-bag-cta"
              onClick={() => {
                const configuredProduct: Product = {
                  ...product,
                  price: activePrice,
                  priceFormatted: `ETB ${activePrice.toLocaleString()}`
                }
                onAddToCart(configuredProduct, currentOption ? currentOption.size : undefined)
              }}
            >
              Add to Bag <ShoppingBag size={16} />
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}
