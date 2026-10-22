'use client'

import React, { useState } from 'react'
import { Heart, ArrowRight, ChevronLeft, ChevronRight, ShoppingBag, Truck } from 'lucide-react'
import { Product } from '@/lib/catalog'

interface ProductCardProps {
  product: Product
  index: number
  isSaved: boolean
  isSelected: boolean
  onToggleSave: (e: React.MouseEvent) => void
  onClickDetails: () => void
  onQuickAdd: (e: React.MouseEvent) => void
  language: 'EN' | 'አማ'
}

export function ProductCard({
  product,
  index,
  isSaved,
  isSelected,
  onToggleSave,
  onClickDetails,
  onQuickAdd,
  language
}: ProductCardProps) {
  // Multiple photos state per item
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const images = (product.images && product.images.length > 0) ? product.images : ['/hero-bike.webp']

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActivePhotoIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    setActivePhotoIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleDotClick = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation()
    setActivePhotoIndex(idx)
  }

  return (
    <article
      className={`product-card ${isSelected ? 'is-selected' : ''}`}
      onClick={onClickDetails}
    >
      <div
        className="product-image-gallery-box"
        style={{ '--bike-tone': product.tone } as React.CSSProperties}
      >
        <span className="card-item-number">{String(index + 1).padStart(2, '0')}</span>

        {/* Favorite Heart Button */}
        <button
          className={`card-heart-btn ${isSaved ? 'is-saved' : ''}`}
          aria-label={`Save ${product.name}`}
          onClick={onToggleSave}
        >
          <Heart fill={isSaved ? '#d9bd6a' : 'none'} color={isSaved ? '#d9bd6a' : '#ffffff'} size={18} />
        </button>

        {/* Badge if available */}
        {product.badge && <span className="card-badge">{product.badge}</span>}

        {/* Multi-Photo Display */}
        <div className="card-photo-wrapper">
          <img
            src={images[activePhotoIndex] || images[0] || '/hero-bike.webp'}
            alt={`${product.name} angle ${activePhotoIndex + 1}`}
            className="card-main-photo"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = '/hero-bike.webp'
            }}
          />
        </div>

        {/* Arrows if multiple photos */}
        {images.length > 1 && (
          <div className="photo-nav-arrows">
            <button
              className="photo-nav-btn prev-btn"
              onClick={handlePrevPhoto}
              aria-label="Previous photo"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="photo-nav-btn next-btn"
              onClick={handleNextPhoto}
              aria-label="Next photo"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Photo Pagination Dots */}
        {images.length > 1 && (
          <div className="photo-dots-strip">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`photo-dot ${activePhotoIndex === idx ? 'active' : ''}`}
                onClick={(e) => handleDotClick(e, idx)}
              />
            ))}
          </div>
        )}

        <div className="card-hover-actions">
          <span className="view-bike-text">View details <ArrowRight size={13} /></span>
          <button
            className="quick-add-btn"
            title="Quick add to bag"
            onClick={onQuickAdd}
          >
            <ShoppingBag size={14} /> Add
          </button>
        </div>
      </div>

      <div className="product-info">
        <div className="product-card-top-meta">
          <div className="flex items-center justify-between gap-1 mb-1">
            <p className="product-category m-0">{product.brand} · {product.category}</p>
            {product.specs?.recommendedHeight && (
              <span className="text-[10px] font-mono font-bold bg-amber-500/15 text-amber-900 px-1.5 py-0.5 rounded border border-amber-500/30 whitespace-nowrap" title="Recommended Rider Height">
                📏 {product.specs.recommendedHeight}
              </span>
            )}
          </div>
          <h3 className="product-card-title">{language === 'አማ' ? product.am : product.name}</h3>
          <p className="product-type-text">{product.type}</p>
        </div>

        {/* Modern Glass Price Tag */}
        <div className="product-card-price-bar">
          <div className="card-price-container">
            <span className="card-price-currency">ETB</span>
            <span className="card-price-amount">{product.price.toLocaleString()}</span>
          </div>
          <span className="card-price-badge"><Truck size={10} /> Free Delivery</span>
        </div>
      </div>
    </article>
  )
}
