'use client'

import React from 'react'
import { Menu, X, UserRound, Heart, ShoppingBag, ChevronDown, Package } from 'lucide-react'
import { UserProfile } from '@/lib/store'

interface NavbarProps {
  onOpenMobileMenu?: () => void
  isMobileMenuOpen?: boolean
  onToggleMobileMenu?: () => void
  onOpenAccount: () => void
  onOpenWishlist: () => void
  onOpenCart: () => void
  onOpenTrackOrder: () => void
  cartCount: number
  wishlistCount: number
  user: UserProfile | null
  language: 'EN' | 'አማ'
  onToggleLanguage: () => void
  onSelectCategory: (cat: string) => void
}

export function Navbar({
  onOpenMobileMenu,
  isMobileMenuOpen = false,
  onToggleMobileMenu,
  onOpenAccount,
  onOpenWishlist,
  onOpenCart,
  onOpenTrackOrder,
  cartCount,
  wishlistCount,
  user,
  language,
  onToggleLanguage,
  onSelectCategory
}: NavbarProps) {
  const scrollToCatalog = (cat: string) => {
    onSelectCategory(cat)
    const el = document.getElementById('bikes')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleHamburgerClick = () => {
    if (onToggleMobileMenu) {
      onToggleMobileMenu()
    } else if (onOpenMobileMenu) {
      onOpenMobileMenu()
    }
  }

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className={`icon-button mobile-only hamburger-btn ${isMobileMenuOpen ? 'is-open' : ''}`}
          aria-label={isMobileMenuOpen ? "Close navigation" : "Open navigation"}
          onClick={handleHamburgerClick}
          title={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <a href="#top" className="brand-logo-link" aria-label="Ride Addis Home">
          <div className="brand-mark">
            <svg viewBox="0 0 42 42" aria-hidden="true" width={32} height={32}>
              <path d="M21 3 38 13v16L21 39 4 29V13L21 3Z" fill="none" stroke="currentColor" strokeWidth="1.7"/>
              <path d="m11 24 6-10 3 6 4-7 7 11h-5l-3-5-3 5h-4l-2 3h-3Z" fill="currentColor"/>
            </svg>
            <span className="brand-text"><strong>RIDE</strong><small>ADDIS</small></span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav-links">
          <button onClick={() => scrollToCatalog('All')} className="nav-link-btn">Bicycles</button>
          <button onClick={() => scrollToCatalog('Helmets')} className="nav-link-btn">Accessories</button>
          <button onClick={() => scrollToCatalog('Road bikes')} className="nav-link-btn">Road & Speed</button>
          <button onClick={() => scrollToCatalog('Mountain bikes')} className="nav-link-btn">Entoto Trails</button>
          <a href="#fit" className="nav-link-btn" style={{ color: 'var(--terracotta)', fontWeight: 700 }}>Find My Bike</a>
          <a href="#faq" className="nav-link-btn">FAQ</a>
          {/* ONLY SHOW TRACK ORDER IF LOGGED IN */}
          {user && (
            <button className="nav-text-btn" onClick={onOpenTrackOrder}>
              <Package size={14} /> Track Order
            </button>
          )}
        </nav>
      </div>

      {/* Nav Actions (Right side: Language, Visible Account UI, Wishlist, Cart) */}
      <div className="nav-actions">
        {/* Language Switcher */}
        <button className="lang-toggle nav-action-item" onClick={onToggleLanguage} title="Switch Language">
          <span>{language}</span> <ChevronDown size={11} />
        </button>

        {/* Clear, Highly Visible Sign In / Register UI Button */}
        <button
          className={`account-nav-btn nav-action-item ${user ? 'is-logged-in' : 'is-guest-cta'}`}
          aria-label="Account Login or Registration"
          onClick={onOpenAccount}
          title={user ? `Signed in as ${user.name}` : 'Sign In / Register'}
        >
          <UserRound size={16} />
          <span className="account-btn-label">
            {user ? user.name.split(' ')[0] : 'Sign In / Register'}
          </span>
        </button>

        {/* Wishlist / Favorites Button (Directly side to Bag) */}
        <button
          className="icon-button wishlist-button nav-action-item"
          aria-label="Saved Favorites"
          onClick={onOpenWishlist}
          title="My Favorites"
        >
          <Heart size={18} fill={wishlistCount > 0 ? 'var(--orange-warm)' : 'none'} color={wishlistCount > 0 ? 'var(--orange-warm)' : 'currentColor'} />
          {wishlistCount > 0 && <i className="badge-pill gold-badge">{wishlistCount}</i>}
        </button>

        {/* Shopping Bag Button */}
        <button
          className="icon-button bag-button nav-action-item"
          aria-label="Shopping bag"
          onClick={onOpenCart}
          title="Shopping Bag"
        >
          <ShoppingBag size={18} />
          {cartCount > 0 && <i className="badge-pill">{cartCount}</i>}
        </button>
      </div>
    </header>
  )
}
