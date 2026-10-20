'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Sparkles, ShoppingBag, ShieldCheck } from 'lucide-react'
import { PRODUCTS, Product } from '@/lib/catalog'
import { loadCustomProducts, CartItem } from '@/lib/store'
import { KidsSizingSection } from '@/components/KidsSizingSection'
import { BikeFinderModal } from '@/components/BikeFinderModal'
import { ProductDetailDrawer } from '@/components/ProductDetailDrawer'
import { CartDrawer } from '@/components/CartDrawer'

export default function KidsBikeSizingPage() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS)
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [guideModalOpen, setGuideModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    setProducts(loadCustomProducts())
    const storedCart = localStorage.getItem('ride_addis_cart')
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart))
      } catch {}
    }
  }, [])

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      let nextCart: CartItem[]
      if (existing) {
        nextCart = prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      } else {
        nextCart = [...prev, { product, quantity: 1 }]
      }
      localStorage.setItem('ride_addis_cart', JSON.stringify(nextCart))
      return nextCart
    })
    setCartOpen(true)
  }

  return (
    <div className="site-shell standalone-sizing-page">
      {/* Minimal Top Header */}
      <header className="standalone-header">
        <Link href="/" className="back-link">
          <ArrowLeft size={16} /> Back to Store
        </Link>
        <div className="brand-mark">
          <svg viewBox="0 0 42 42" aria-hidden="true" width={28} height={28}>
            <path d="M21 3 38 13v16L21 39 4 29V13L21 3Z" fill="none" stroke="currentColor" strokeWidth="1.7"/>
            <path d="m11 24 6-10 3 6 4-7 7 11h-5l-3-5-3 5h-4l-2 3h-3Z" fill="currentColor"/>
          </svg>
          <span><strong>RIDE</strong><small>ADDIS</small></span>
        </div>
        <button className="icon-button" onClick={() => setCartOpen(true)} title="View Bag">
          <ShoppingBag size={18} />
          {cart.length > 0 && <span className="badge-pill">{cart.length}</span>}
        </button>
      </header>

      {/* Main Sizing Content */}
      <main className="standalone-sizing-main">
        <div className="sizing-page-wrapper">
          <KidsSizingSection
            products={products}
            onOpenSizingGuide={() => setGuideModalOpen(true)}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onAddToCart={handleAddToCart}
          />
        </div>
      </main>

      {/* Modals & Drawers */}
      <BikeFinderModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onAddToCart={handleAddToCart}
      />

      {selectedProduct && (
        <ProductDetailDrawer
          product={selectedProduct}
          isOpen={Boolean(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(p) => handleAddToCart(p)}
          isSaved={false}
          onToggleSave={() => {}}
          language="EN"
        />
      )}

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        language="EN"
        onUpdateQuantity={(id, delta) => {
          setCart((prev) => {
            const next = prev
              .map((it) => (it.product.id === id ? { ...it, quantity: it.quantity + delta } : it))
              .filter((it) => it.quantity > 0)
            localStorage.setItem('ride_addis_cart', JSON.stringify(next))
            return next
          })
        }}
        onRemoveItem={(id) => {
          setCart((prev) => {
            const next = prev.filter((it) => it.product.id !== id)
            localStorage.setItem('ride_addis_cart', JSON.stringify(next))
            return next
          })
        }}
        onProceedToCheckout={() => {
          window.location.href = '/#bikes'
        }}
      />
    </div>
  )
}
