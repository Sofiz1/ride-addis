'use client'

import React from 'react'
import { X, Heart, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react'
import { Product } from '@/lib/catalog'

interface FavoritesDrawerProps {
  isOpen: boolean
  onClose: () => void
  savedProducts: Product[]
  onRemoveFavorite: (productId: string) => void
  onAddToCart: (product: Product) => void
  onMoveAllToBag: () => void
  language: 'EN' | 'አማ'
}

export function FavoritesDrawer({
  isOpen,
  onClose,
  savedProducts,
  onRemoveFavorite,
  onAddToCart,
  onMoveAllToBag,
  language
}: FavoritesDrawerProps) {
  if (!isOpen) return null

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="drawer wishlist-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <span className="eyebrow">YOUR SAVED GEAR</span>
            <h2>Favorites ({savedProducts.length})</h2>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close favorites">
            <X size={20} />
          </button>
        </div>

        {savedProducts.length === 0 ? (
          <div className="empty-drawer-state">
            <div className="empty-icon-circle">
              <Heart size={32} />
            </div>
            <h3>No favorites saved yet</h3>
            <p>
              Click the heart icon on any bicycle or accessory in our collection to save it to your wishlist.
            </p>
            <button className="button button-dark" onClick={onClose}>
              Explore Collection <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <>
            <div className="drawer-items-list">
              {savedProducts.map((product) => (
                <div key={product.id} className="wishlist-item-card">
                  <div className="wishlist-item-thumb">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = '/hero-bike.png'
                      }}
                    />
                  </div>
                  <div className="wishlist-item-info">
                    <span className="item-category-tag">{product.category}</span>
                    <h4>{language === 'አማ' ? product.am : product.name}</h4>
                    <p className="item-type-line">{product.type}</p>
                    <strong className="item-price">{product.priceFormatted}</strong>

                    <div className="wishlist-item-actions">
                      <button
                        className="button button-dark btn-sm"
                        onClick={() => {
                          onAddToCart(product)
                        }}
                      >
                        <ShoppingBag size={14} /> Add to Bag
                      </button>
                      <button
                        className="icon-link text-danger"
                        onClick={() => onRemoveFavorite(product.id)}
                        title="Remove from favorites"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="drawer-bottom-actions">
              <button className="button button-dark full-width" onClick={onMoveAllToBag}>
                Move All to Bag ({savedProducts.length}) <ShoppingBag size={15} />
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
