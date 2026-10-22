'use client'

import React from 'react'
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Truck, CheckCircle2 } from 'lucide-react'
import { CartItem } from '@/lib/store'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  onUpdateQuantity: (productId: string, delta: number, size?: string) => void
  onRemoveItem: (productId: string, size?: string) => void
  onProceedToCheckout: () => void
  language: 'EN' | 'አማ'
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  language
}: CartDrawerProps) {
  if (!isOpen) return null

  const subtotal = items.reduce((acc, it) => acc + it.product.price * it.quantity, 0)
  const freeShippingThreshold = 50000
  const isFreeShipping = subtotal >= freeShippingThreshold
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))
  const remainingForFree = freeShippingThreshold - subtotal

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="drawer cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <span className="eyebrow">YOUR CYCLING BAG</span>
            <h2>Shopping Bag ({items.reduce((acc, it) => acc + it.quantity, 0)})</h2>
          </div>
          <button className="drawer-close" onClick={onClose} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {/* Free Delivery Meter (CycleSouq Style) */}
        <div className="delivery-meter-box">
          <div className="delivery-meter-text">
            <Truck size={16} />
            {isFreeShipping ? (
              <span className="success-text">
                <CheckCircle2 size={14} className="inline-icon" /> Free Addis Ababa delivery unlocked!
              </span>
            ) : (
              <span>
                Add <strong>ETB {remainingForFree.toLocaleString()}</strong> more for <strong>FREE Addis Delivery</strong>
              </span>
            )}
          </div>
          <div className="delivery-progress-track">
            <div
              className={`delivery-progress-fill ${isFreeShipping ? 'is-complete' : ''}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {items.length === 0 ? (
          <div className="empty-drawer-state">
            <div className="empty-icon-circle">
              <ShoppingBag size={32} />
            </div>
            <h3>Nothing here yet</h3>
            <p>Your next great ride or essential gear is waiting in our collection.</p>
            <button className="button button-dark" onClick={onClose}>
              Explore Collection <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <>
            <div className="drawer-items-list">
              {items.map(({ product, quantity, selectedSize }) => (
                <div key={`${product.id}-${selectedSize || 'default'}`} className="cart-item-row">
                  <div className="cart-item-thumb">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = '/hero-bike.webp'
                      }}
                    />
                  </div>
                  <div className="cart-item-details">
                    <div className="cart-item-top">
                      <h4>{language === 'አማ' ? product.am : product.name}</h4>
                      <button
                        className="icon-link text-danger"
                        onClick={() => onRemoveItem(product.id, selectedSize)}
                        title="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <p className="item-type-line">
                      {product.brand} {selectedSize ? `· ${selectedSize.split(' ')[0]}` : ''}
                    </p>

                    <div className="cart-item-bottom">
                      <div className="quantity-controller">
                        <button
                          className="qty-btn"
                          onClick={() => onUpdateQuantity(product.id, -1, selectedSize)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="qty-number">{quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => onUpdateQuantity(product.id, 1, selectedSize)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <strong className="item-subtotal">
                        ETB {(product.price * quantity).toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-summary-line">
                <span>Estimated Subtotal</span>
                <strong>ETB {subtotal.toLocaleString()}</strong>
              </div>
              <div className="cart-summary-line">
                <span>Addis Ababa Delivery</span>
                <span>{isFreeShipping ? 'FREE' : 'ETB 1,200'}</span>
              </div>
              <p className="cart-note">
                Bicycles are delivered fully assembled, safety-inspected, and calibrated by certified Addis Ababa mechanics.
              </p>
              <button
                className="button button-dark full-width checkout-cta"
                onClick={() => {
                  onClose()
                  onProceedToCheckout()
                }}
              >
                Proceed to Checkout <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
