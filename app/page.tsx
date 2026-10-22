'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, Ruler, Search, Heart, ShoppingBag, Package, ShieldCheck, SlidersHorizontal, RotateCcw, X, Scale } from 'lucide-react'
import { ScrollReveal } from '@/components/ScrollReveal'
import { ALL_CATEGORIES, ALL_BRANDS, Product, PRODUCTS } from '@/lib/catalog'
import {
  UserProfile,
  CartItem,
  Order,
  AdminSettings,
  loadUserFromStorage,
  saveUserToStorage,
  loadOrdersFromStorage,
  saveOrdersToStorage,
  loadAdminSettings,
  saveAdminSettings,
  loadCustomProducts,
  saveCustomProducts,
  CategoryItem,
  loadCategories
} from '@/lib/store'
import dynamic from 'next/dynamic'
import { Navbar } from '@/components/Navbar'
import { MobileMenu } from '@/components/MobileMenu'
import { ProductCard } from '@/components/ProductCard'
import { CloudDivider } from '@/components/CloudDivider'
import { AnubiCyclingHero } from '@/components/AnubiCyclingHero'
import { FaqSection } from '@/components/FaqSection'

/**
 * Performance: every drawer, modal and below-the-fold section is code-split.
 * They only mount on interaction (or on scroll), so the initial payload for
 * the homepage stays lean and first paint happens faster.
 */
const ProductDetailDrawer = dynamic(
  () => import('@/components/ProductDetailDrawer').then((m) => m.ProductDetailDrawer),
  { ssr: false }
)
const FavoritesDrawer = dynamic(
  () => import('@/components/FavoritesDrawer').then((m) => m.FavoritesDrawer),
  { ssr: false }
)
const CartDrawer = dynamic(
  () => import('@/components/CartDrawer').then((m) => m.CartDrawer),
  { ssr: false }
)
const CheckoutModal = dynamic(
  () => import('@/components/CheckoutModal').then((m) => m.CheckoutModal),
  { ssr: false }
)
const OrderTrackerModal = dynamic(
  () => import('@/components/OrderTrackerModal').then((m) => m.OrderTrackerModal),
  { ssr: false }
)
const AccountModal = dynamic(
  () => import('@/components/AccountModal').then((m) => m.AccountModal),
  { ssr: false }
)
const BikeFinderModal = dynamic(
  () => import('@/components/BikeFinderModal').then((m) => m.BikeFinderModal),
  { ssr: false }
)
const KidsSizingSection = dynamic(
  () => import('@/components/KidsSizingSection').then((m) => m.KidsSizingSection),
  { ssr: false }
)
const RideAddisAI = dynamic(
  () => import('@/components/RideAddisAI').then((m) => m.RideAddisAI),
  { ssr: false }
)
const TermsModal = dynamic(
  () => import('@/components/TermsModal').then((m) => m.TermsModal),
  { ssr: false }
)
const GoogleReviewsSection = dynamic(
  () => import('@/components/GoogleReviewsSection').then((m) => m.GoogleReviewsSection),
  { ssr: false }
)

export default function Page() {
  const [language, setLanguage] = useState<'EN' | 'አማ'>('EN')
  const isAm = language === 'አማ'

  // Application State
  const [user, setUser] = useState<UserProfile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [wishlist, setWishlist] = useState<string[]>([])
  const [products, setProducts] = useState<Product[]>(PRODUCTS)
  const [adminSettings, setAdminSettings] = useState<AdminSettings | null>(null)

  // Filtering & Catalog State
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [category, setCategory] = useState('All')
  const [brand, setBrand] = useState('All brands')
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(6)

  // UI Modals & Drawers
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [trackerOpen, setTrackerOpen] = useState(false)
  const [trackerInitialId, setTrackerInitialId] = useState<string | undefined>(undefined)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Initialize from LocalStorage
  useEffect(() => {
    setUser(loadUserFromStorage())
    setOrders(loadOrdersFromStorage())
    const localProds = loadCustomProducts()
    if (localProds && localProds.length > 0) {
      setProducts(localProds)
    }
    fetch('/api/products')
      .then(r => r.json())
      .then(json => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setProducts(json.data)
          saveCustomProducts(json.data)
        }
      })
      .catch(() => {})
    setAdminSettings(loadAdminSettings())
    fetch('/api/settings')
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          setAdminSettings(json.data)
          saveAdminSettings(json.data)
        }
      })
      .catch(() => {})
    setCategories(loadCategories())

    const storedCart = localStorage.getItem('ride_addis_cart')
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart))
      } catch {}
    }

    const storedWishlist = localStorage.getItem('ride_addis_wishlist')
    if (storedWishlist) {
      try {
        setWishlist(JSON.parse(storedWishlist))
      } catch {}
    }
  }, [])

  // Persist Cart
  useEffect(() => {
    localStorage.setItem('ride_addis_cart', JSON.stringify(cart))
  }, [cart])

  // Persist Wishlist
  useEffect(() => {
    localStorage.setItem('ride_addis_wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  // Reset visibleCount when filters change
  useEffect(() => {
    setVisibleCount(6)
  }, [category, brand, searchQuery])
  useEffect(() => {
    const handleSync = () => {
      setProducts(loadCustomProducts())
      setAdminSettings(loadAdminSettings())
      setOrders(loadOrdersFromStorage())
      setCategories(loadCategories())
    }
    window.addEventListener('storage', handleSync)
    window.addEventListener('focus', handleSync)
    return () => {
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('focus', handleSync)
    }
  }, [])

  // Check if any modal or drawer overlay is currently active
  const isAnyOverlayActive = Boolean(
    accountOpen ||
    menuOpen ||
    selectedProduct ||
    quizOpen ||
    cartOpen ||
    wishlistOpen ||
    checkoutOpen ||
    trackerOpen ||
    termsOpen
  )

  // Prevent background page from scrolling while any modal/drawer is open
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (isAnyOverlayActive) {
      const prevBodyOverflow = document.body.style.overflow
      const prevHtmlOverflow = document.documentElement.style.overflow
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prevBodyOverflow
        document.documentElement.style.overflow = prevHtmlOverflow
      }
    }
  }, [isAnyOverlayActive])


  // Update user with persistence
  const handleUpdateUser = (updated: UserProfile | null) => {
    setUser(updated)
    saveUserToStorage(updated)
  }

  // Update orders with persistence
  const handleOrderPlaced = (newOrder: Order) => {
    const updated = [newOrder, ...orders]
    setOrders(updated)
    saveOrdersToStorage(updated)
    setCart([]) // Clear cart after successful checkout
  }

  // Cart Operations (CRUD) - Unauthenticated users cannot add to bag!
  const handleAddToCart = (product: Product, size?: string) => {
    if (!user) {
      setAccountOpen(true)
      return
    }
    setCart((prev) => {
      const existing = prev.find(
        (it) => it.product.id === product.id && (it.selectedSize || '') === (size || '')
      )
      if (existing) {
        return prev.map((it) =>
          it.product.id === product.id && (it.selectedSize || '') === (size || '')
            ? { ...it, quantity: it.quantity + 1 }
            : it
        )
      }
      return [...prev, { product, quantity: 1, selectedSize: size }]
    })
    setCartOpen(true)
  }

  const handleUpdateQuantity = (productId: string, delta: number, size?: string) => {
    setCart((prev) =>
      prev
        .map((it) => {
          if (it.product.id === productId && (it.selectedSize || '') === (size || '')) {
            const newQty = it.quantity + delta
            return newQty > 0 ? { ...it, quantity: newQty } : null
          }
          return it
        })
        .filter(Boolean) as CartItem[]
    )
  }

  const handleRemoveFromCart = (productId: string, size?: string) => {
    setCart((prev) =>
      prev.filter((it) => !(it.product.id === productId && (it.selectedSize || '') === (size || '')))
    )
  }

  // Wishlist Operations (CRUD) - Unauthenticated users cannot save favorites!
  const handleToggleWishlist = (productId: string) => {
    if (!user) {
      setAccountOpen(true)
      return
    }
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  const handleMoveAllToBag = () => {
    const savedItems = products.filter((p) => wishlist.includes(p.id))
    savedItems.forEach((product) => {
      setCart((prev) => {
        const existing = prev.find((it) => it.product.id === product.id)
        if (existing) {
          return prev.map((it) =>
            it.product.id === product.id ? { ...it, quantity: it.quantity + 1 } : it
          )
        }
        return [...prev, { product, quantity: 1 }]
      })
    })
    setWishlist([])
    setWishlistOpen(false)
    setCartOpen(true)
  }

  // Filter products
  const visibleProducts = products.filter((product) => {
    const matchesCategory = category === 'All' || product.category === category
    const matchesBrand = brand === 'All brands' || product.brand === brand
    const matchesSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.type.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesBrand && matchesSearch
  })

  const savedProducts = products.filter((p) => wishlist.includes(p.id))
  const totalCartCount = cart.reduce((acc, it) => acc + it.quantity, 0)

  // Live headlines from admin
  const heroHeading = isAm
    ? adminSettings?.heroTitleAm || 'አዲስን በአዲስ መንገድ ይጓዙ።'
    : adminSettings?.heroTitleEn || 'Move through Addis differently.'

  const heroSub = isAm
    ? adminSettings?.heroSubtitleAm || 'ለከተማችን ምት የተሰራ የብስክሌት ልምድ። ከአስፋልት እስከ ዕንጦጦ ተራራ ድረስ።'
    : adminSettings?.heroSubtitleEn || 'Bicycles selected for Addis altitude, climbs, and streets. Discover a better way to move.'

  return (
    <main className="site-shell">
      {/* Sticky Header Container (Top Marquee Bar + Main Navigation) */}
      <div className="sticky-header-container">
        {/* Top Banner with Infinite Looping Marquee */}
        <div className="topline">
          <div className="topline-marquee">
            <div className="topline-marquee-track">
              <span>{isAm ? (adminSettings?.announcementAm || 'ጥራት ያለው ጉዞ ከአዲስ አበባ · ሙሉ ለሙሉ የተገጣጠሙ ብስክሌቶች') : (adminSettings?.bannerNotice || 'FREE DELIVERY IN ADDIS ABABA ON ORDERS OVER ETB 50,000 · ASSEMBLED READY-TO-RIDE')}</span>
              <span className="marquee-sep">·</span>
              <span>{adminSettings?.announcementAm || 'ጥራት ያለው ጉዞ ከአዲስ አበባ'}</span>
              <span className="marquee-sep">·</span>
              <span>{adminSettings?.bannerNotice || 'FREE DELIVERY IN ADDIS ABABA ON ORDERS OVER ETB 50,000 · ASSEMBLED READY-TO-RIDE'}</span>
              <span className="marquee-sep">·</span>
              <span>{adminSettings?.announcementAm || 'ጥራት ያለው ጉዞ ከአዲስ አበባ'}</span>
            </div>
          </div>
          {/* ONLY DISPLAY TRACK ORDER IF USER IS LOGGED IN - NO SIGN IN TO TRACK TEXT */}
          {user && (
            <button
              className="topline-track-btn"
              onClick={() => {
                setTrackerInitialId(orders[0]?.id)
                setTrackerOpen(true)
              }}
            >
              <Package size={12} /> Track Your Order ({orders.length})
            </button>
          )}
        </div>

        {/* Main Navbar */}
        <Navbar
          isMobileMenuOpen={menuOpen}
          onToggleMobileMenu={() => setMenuOpen((prev) => !prev)}
          onOpenMobileMenu={() => setMenuOpen(true)}
          onOpenAccount={() => setAccountOpen(true)}
          onOpenWishlist={() => {
            if (!user) {
              setAccountOpen(true)
              return
            }
            setWishlistOpen(true)
          }}
          onOpenCart={() => {
            if (!user) {
              setAccountOpen(true)
              return
            }
            setCartOpen(true)
          }}
          onOpenTrackOrder={() => {
            setTrackerInitialId(orders[0]?.id)
            setTrackerOpen(true)
          }}
          cartCount={totalCartCount}
          wishlistCount={wishlist.length}
          user={user}
          language={language}
          onToggleLanguage={() => setLanguage(isAm ? 'EN' : 'አማ')}
          onSelectCategory={(cat) => setCategory(cat)}
        />
      </div>

      {/* Mobile Drawer (CycleSouq Mega-Menu Style) */}
      <MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onSelectCategory={(cat) => setCategory(cat)}
        onSelectBrand={(b) => setBrand(b)}
        onOpenAccount={() => setAccountOpen(true)}
        onOpenBikeFinder={() => setQuizOpen(true)}
        userName={user?.name}
        isLoggedIn={Boolean(user)}
        language={language}
        onToggleLanguage={() => setLanguage(isAm ? 'EN' : 'አማ')}
      />

      {/* Anubi.io-Style High Altitude Velocraft Orbital Hero */}
      <AnubiCyclingHero
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onOpenBikeFinder={() => setQuizOpen(true)}
        isAm={isAm}
      />

      {/* Catalog Collection Section */}
      <section id="bikes" className="collection">
        <ScrollReveal animation="fade-up">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE COLLECTION & GEAR</p>
            <h2>{isAm ? 'የከተማው ምትና ብስክሌቶች' : 'Find your rhythm.'}</h2>
            <p className="section-lede">
              Every bike and accessory is calibrated for Addis streets. Swipe or filter below.
            </p>
          </div>
          <div className="section-heading-actions">
            <button
              className="text-link"
              onClick={() => {
                setCategory('All')
                setBrand('All brands')
                setSearchQuery('')
                setVisibleCount(6)
              }}
            >
              Reset all filters <ArrowRight size={14} />
            </button>
          </div>
        </div>
        </ScrollReveal>

        {/* Live Controls: Category Tabs, Brand Dropdown, and Search */}
        <div className="catalog-controls-container">
          <div className="catalog-top-controls">
            <div className="category-tabs" aria-label="Bike and gear categories">
              {(categories.length > 0 ? categories : ALL_CATEGORIES.map(c => ({ id: c, name: c, nameAm: c }))).map((item: any) => (
                <button
                  className={category === (item.name || item) ? 'active' : ''}
                  key={item.id || item}
                  onClick={() => setCategory(item.name || item)}
                >
                  {isAm ? (item.nameAm || item.name || item) : (item.name || item)}
                </button>
              ))}
            </div>

            <div className="catalog-right-filters">
              {/* Brand Filter */}
              <label className="brand-select">
                <span>Brand</span>
                <select value={brand} onChange={(e) => setBrand(e.target.value)}>
                  {ALL_BRANDS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              {/* Search input */}
              <div className="catalog-search-input">
                <Search size={15} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bike, helmet..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Cards Grid (Horizontal Swipe on Mobile!) */}
        {visibleProducts.length === 0 ? (
          <div className="no-products-card-ui">
            <div className="no-products-icon-wrap">
              <SlidersHorizontal size={28} />
            </div>
            <span className="no-products-eyebrow">CATALOG FILTER</span>
            <h3>{isAm ? 'ምንም የተገኘ ብስክሌት ወይም ዕቃ የለም' : 'No products match your filter'}</h3>
            <p className="no-products-lead">
              {isAm
                ? 'የመረጡትን ምድብ ወይም የፍለጋ ቃል በማስተካከል እንደገና ይሞክሩ።'
                : 'Try resetting the category or search criteria to view our full collection of bicycles and gear.'}
            </p>

            {/* Active Filters Display with Instant Clear */}
            {(category !== 'All' || brand !== 'All brands' || searchQuery.trim()) && (
              <div className="active-filter-chips">
                {category !== 'All' && (
                  <span className="filter-chip">
                    Category: <strong>{category}</strong>
                    <button onClick={() => setCategory('All')} aria-label="Clear category filter">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {brand !== 'All brands' && (
                  <span className="filter-chip">
                    Brand: <strong>{brand}</strong>
                    <button onClick={() => setBrand('All brands')} aria-label="Clear brand filter">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {searchQuery.trim() && (
                  <span className="filter-chip">
                    Search: <strong>"{searchQuery}"</strong>
                    <button onClick={() => setSearchQuery('')} aria-label="Clear search">
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>
            )}

            <div className="no-products-actions">
              <button
                className="button button-dark reset-filters-btn"
                onClick={() => {
                  setCategory('All')
                  setBrand('All brands')
                  setSearchQuery('')
                }}
              >
                <RotateCcw size={14} /> Reset All Filters & View Full Catalog
              </button>
            </div>

            {/* Quick Category Suggestions */}
            <div className="no-products-quick-links">
              <small>POPULAR:</small>
              <button onClick={() => { setCategory('Road bikes'); setSearchQuery(''); }}>Road bikes</button>
              <span>·</span>
              <button onClick={() => { setCategory('Mountain bikes'); setSearchQuery(''); }}>Mountain bikes</button>
              <span>·</span>
              <button onClick={() => { setCategory('City bikes'); setSearchQuery(''); }}>City bikes</button>
              <span>·</span>
              <button onClick={() => { setCategory('Helmets'); setSearchQuery(''); }}>Helmets</button>
            </div>
          </div>
        ) : (
          <div>
            <div className="product-grid mobile-swipe-carousel">
              {visibleProducts.slice(0, visibleCount).map((product, index) => (
                <ScrollReveal key={product.id} animation="fade-up" delay={index * 80} threshold={0.08}>
                  <ProductCard
                    product={product}
                    index={index}
                    isSaved={wishlist.includes(product.id)}
                    isSelected={selectedProduct?.id === product.id}
                    onToggleSave={(e) => {
                      e.stopPropagation()
                      handleToggleWishlist(product.id)
                    }}
                    onClickDetails={() => setSelectedProduct(product)}
                    onQuickAdd={(e) => {
                      e.stopPropagation()
                      const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : null
                      const itemToAdd = defaultSize
                        ? { ...product, price: defaultSize.price, priceFormatted: `ETB ${defaultSize.price.toLocaleString()}` }
                        : product
                      handleAddToCart(itemToAdd, defaultSize ? defaultSize.size : undefined)
                    }}
                    language={language}
                  />
                </ScrollReveal>
              ))}
            </div>

            {/* Prominent See More Bicycles & Gear for PC (after 6 items) + Features Showcase */}
            {visibleProducts.length > visibleCount && (
              <div className="mt-14 text-center">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className="inline-flex items-center gap-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-8 py-4 rounded-full border border-neutral-700 hover:border-amber-400 transition-all duration-300 shadow-2xl text-sm group"
                >
                  <span>{isAm ? 'ተጨማሪ ብስክሌቶችና እቃዎች እይ' : 'See More Bicycles & Gear'}</span>
                  <span className="text-xs bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full font-mono">
                    +{visibleProducts.length - visibleCount} more
                  </span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition" />
                </button>
              </div>
            )}
          </div>
        )}
        {/* Cloud Transition into Fit Lab Banner */}
        <CloudDivider fill="#d9d0b8" position="bottom" flipX />
      </section>

      {/* CycleSouq Kids Sizing Module - "Buy the bike that actually fits" */}
      <section id="fit" className="fit-banner cyclesouq-container-section">
        <ScrollReveal animation="fade-up" className="fit-banner-inner">
          <KidsSizingSection
            products={products}
            onOpenSizingGuide={() => setQuizOpen(true)}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onAddToCart={(p) => handleAddToCart(p)}
            onFilterCategory={(cat) => {
              setCategory(cat)
              const el = document.getElementById('bikes')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
          />
        </ScrollReveal>

        {/* Cloud Transition into Story */}
        <CloudDivider fill="#526c58" position="bottom" />
      </section>

      {/* Story Section */}
      <section id="story" className="story">
        <ScrollReveal animation="fade-right">
        <div className="story-block">
          <p className="eyebrow">THE RIDE ADDIS STANDARD</p>
          <h2>Every street has a story. We build the vehicle.</h2>
          <p>
            From the early morning climb up Entoto to the fast asphalt paceline toward Bishoftu, Ride Addis delivers bicycles and gear that truly belong here. Honest craftsmanship, certified workshop tune-up, and real pride in every journey.
          </p>
          <a className="text-link" href="#bikes">
            Discover the collection <ArrowRight size={14} />
          </a>
        </div>
        </ScrollReveal>
        <ScrollReveal animation="scale-up" delay={200}>
        <div className="story-stat">
          <strong>2,355<span>m</span></strong>
          <p>above sea level<br />and still climbing</p>
        </div>
        </ScrollReveal>

        {/* Cloud Transition into Reviews Cloud Page */}
        <CloudDivider fill="#1f2c22" position="bottom" flipX />
      </section>

      {/* Verified Google Reviews from Ethiopian Customers (6 Reviews) */}
      <GoogleReviewsSection isAm={isAm} />

      {/* Frequently Asked Questions Section */}
      <FaqSection />

      {/* Professional Bottom Footer */}
      <footer id="service" className="site-footer">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-brand-col">
            <div className="brand-mark">
              <svg viewBox="0 0 42 42" aria-hidden="true" width={32} height={32}>
                <path d="M21 3 38 13v16L21 39 4 29V13L21 3Z" fill="none" stroke="currentColor" strokeWidth="1.7"/>
                <path d="m11 24 6-10 3 6 4-7 7 11h-5l-3-5-3 5h-4l-2 3h-3Z" fill="currentColor"/>
              </svg>
              <span><strong>RIDE</strong><small>ADDIS</small></span>
            </div>
            <p className="footer-brand-bio">
              High-altitude cycling and urban mobility built for Addis Ababa. Precision calibrated, delivered fully assembled, and ready for your ride.
            </p>
            <div className="footer-location-tag">
              <span>Location:</span> <strong>Addis Ababa, Ethiopia</strong>
            </div>

            {/* Social Icons: Instagram, TikTok, WhatsApp, Telegram */}
            <div className="footer-social-row">
              <a
                href="https://instagram.com/rideaddis"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                aria-label="Instagram"
                title="Follow Ride Addis on Instagram"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>

              <a
                href="https://tiktok.com/@rideaddis"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                aria-label="TikTok"
                title="Follow Ride Addis on TikTok"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.47 6.27 6.27 0 0 0 1.87-4.46V8.67a8.21 8.21 0 0 0 4.9 1.6v-3.58z"/>
                </svg>
              </a>

              <a
                href="https://wa.me/251911234567"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                aria-label="WhatsApp"
                title="Chat with Ride Addis on WhatsApp"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.4-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29z"/>
                </svg>
              </a>

              <a
                href="https://t.me/rideaddis"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn"
                aria-label="Telegram"
                title="Join Ride Addis on Telegram"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l-.313 4.693c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-links-col">
            <h4>Bicycles & Gear</h4>
            <a href="#bikes" onClick={() => setCategory('All')}>All Bicycles</a>
            <a href="#bikes" onClick={() => setCategory('Road bikes')}>Road & Speed</a>
            <a href="#bikes" onClick={() => setCategory('Mountain bikes')}>Entoto Trail 29ers</a>
            <a href="#bikes" onClick={() => setCategory('City bikes')}>City Commuters</a>
            <a href="#bikes" onClick={() => setCategory('Kids bikes')}>Kids & Youth</a>
            <a href="#bikes" onClick={() => setCategory('Helmets')}>Helmets & Gear</a>
          </div>

          {/* Customer Care */}
          <div className="footer-links-col">
            <h4>Customer Support</h4>
            <a href="#faq">Frequently Asked Questions</a>
            <button onClick={() => setQuizOpen(true)} className="footer-btn-link">Find My Bike Sizing</button>
            <button onClick={() => setTermsOpen(true)} className="footer-btn-link">Terms of Service & Privacy</button>
            {user ? (
              <button
                onClick={() => {
                  setTrackerInitialId(orders[0]?.id)
                  setTrackerOpen(true)
                }}
                className="footer-btn-link"
              >
                Track Live Order
              </button>
            ) : null}
            <button onClick={() => setAccountOpen(true)} className="footer-btn-link">
              {user ? 'My Account Profile' : 'Sign In / Register'}
            </button>
          </div>

          {/* Verified Payments in Addis Ababa */}
          <div className="footer-payments-col">
            <h4>Verified Payments</h4>
            <p className="footer-pay-info">
              Direct Telebirr, CBEBirr, and Commercial Bank of Ethiopia (CBE) transfers verified seamlessly upon checkout.
            </p>
            <div className="footer-pay-badges">
              <div className="pay-logo-badge" title="Telebirr (0966245048 - Fraol Woldekidan)">
                <img
                  src="/telebirr-logo.svg"
                  alt="Telebirr Official Logo"
                  className="pay-logo-img telebirr-logo-img"
                />
              </div>
              <div className="pay-logo-badge" title="CBEBirr (0966245048 - Fraol Woldekidan)">
                <img
                  src="/cbe-birr-logo.svg"
                  alt="CBE Birr Official Logo"
                  className="pay-logo-img cbe-logo-img"
                />
              </div>
              <div className="pay-logo-badge cbe-gold-badge" title="Commercial Bank of Ethiopia (CBE 1000359050047 - Fraol Woldekidan)">
                <img
                  src="/cbe-logo.webp"
                  alt="Commercial Bank of Ethiopia (CBE)"
                  className="pay-logo-img cbe-gold-logo-img"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom-bar">
          <span>© 2026 Ride Addis. All rights reserved.</span>
          <div className="footer-legal-links">
            <button onClick={() => setTermsOpen(true)} className="footer-legal-btn">Terms of Service</button>
            <span className="dot-sep">·</span>
            <button onClick={() => setTermsOpen(true)} className="footer-legal-btn">Privacy Policy</button>
          </div>
          <span>Addis Ababa, Ethiopia</span>
        </div>
      </footer>

      {/* ================= RIDE ADDIS AI CHATBOT ================= */}
      <RideAddisAI
        onSelectProduct={(p) => setSelectedProduct(p)}
        onOpenTrackOrder={() => {
          setTrackerInitialId(orders[0]?.id)
          setTrackerOpen(true)
        }}
        onOpenFinder={() => setQuizOpen(true)}
        orders={orders}
        isLoggedIn={Boolean(user)}
        products={products}
      />

      {/* ================= ALL MODALS & DRAWERS ================= */}

      {/* 1. Product Detail Drawer */}
      <ProductDetailDrawer
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, size) => handleAddToCart(p, size)}
        isSaved={selectedProduct ? wishlist.includes(selectedProduct.id) : false}
        onToggleSave={() => {
          if (selectedProduct) handleToggleWishlist(selectedProduct.id)
        }}
        language={language}
      />

      {/* 2. Favorites / Wishlist Drawer (Side to Bag) */}
      <FavoritesDrawer
        isOpen={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        savedProducts={savedProducts}
        onRemoveFavorite={(id) => handleToggleWishlist(id)}
        onAddToCart={(p) => handleAddToCart(p)}
        onMoveAllToBag={handleMoveAllToBag}
        language={language}
      />

      {/* 3. Cart Drawer with Free Delivery Meter */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => setCheckoutOpen(true)}
        language={language}
      />

      {/* 4. Checkout & Payment Modal (Telebirr, CBE Birr, Cash on Delivery with Ref Number) */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={cart}
        user={user}
        onOrderPlaced={handleOrderPlaced}
        onOpenTrackOrder={(orderId) => {
          setTrackerInitialId(orderId)
          setTrackerOpen(true)
        }}
      />

      {/* 5. Live Order Tracking HUD */}
      <OrderTrackerModal
        isOpen={trackerOpen}
        onClose={() => setTrackerOpen(false)}
        orders={orders}
        initialOrderId={trackerInitialId}
      />

      {/* 6. Account Modal with Full Operational CRUD */}
      <AccountModal
        isOpen={accountOpen}
        onClose={() => setAccountOpen(false)}
        user={user}
        onUpdateUser={handleUpdateUser}
        orders={orders}
        onTrackOrder={(id) => {
          setTrackerInitialId(id)
          setTrackerOpen(true)
        }}
        onOpenWishlist={() => setWishlistOpen(true)}
        wishlistCount={wishlist.length}
        onOpenTerms={() => setTermsOpen(true)}
        isAm={isAm}
      />

      {/* 7. Bike Finder Modal (Fixed Smooth Animation) */}
      <BikeFinderModal
        isOpen={quizOpen}
        onClose={() => setQuizOpen(false)}
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onAddToCart={(p) => handleAddToCart(p)}
      />

      {/* 8. Terms of Service & Privacy Policy Modal */}
      <TermsModal
        isOpen={termsOpen}
        onClose={() => setTermsOpen(false)}
      />
    </main>
  )
}
