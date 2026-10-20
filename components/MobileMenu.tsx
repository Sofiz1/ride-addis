'use client'

import React, { useState } from 'react'
import { X, ChevronDown, ChevronRight, UserRound, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  onSelectCategory: (category: string) => void
  onSelectBrand: (brand: string) => void
  onOpenAccount: () => void
  onOpenBikeFinder: () => void
  userName?: string
  isLoggedIn: boolean
  language: 'EN' | 'አማ'
  onToggleLanguage: () => void
}

export function MobileMenu({
  isOpen,
  onClose,
  onSelectCategory,
  onSelectBrand,
  onOpenAccount,
  onOpenBikeFinder,
  userName,
  isLoggedIn,
  language,
  onToggleLanguage
}: MobileMenuProps) {
  // Accordions for Bicycles, Accessories, Brands, Services
  const [expandedSection, setExpandedSection] = useState<'bikes' | 'accessories' | 'brands' | 'services' | null>('bikes')

  if (!isOpen) return null

  const toggleSection = (section: 'bikes' | 'accessories' | 'brands' | 'services') => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const handleSubItemClick = (type: 'category' | 'brand', value: string) => {
    if (type === 'category') {
      onSelectCategory(value)
    } else if (type === 'brand') {
      onSelectBrand(value)
    }
    // Smoothly scroll down to the cycles section (#bikes), NOT the hero!
    setTimeout(() => {
      const el = document.getElementById('bikes')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
    onClose()
  }

  return (
    <div className="mobile-menu-backdrop" onClick={onClose}>
      <div className="mobile-menu-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header with Brand and Close Button */}
        <div className="mobile-menu-header">
          <div className="brand-mark">
            <svg viewBox="0 0 42 42" aria-hidden="true" width={28} height={28}>
              <path d="M21 3 38 13v16L21 39 4 29V13L21 3Z" fill="none" stroke="currentColor" strokeWidth="1.7"/>
              <path d="m11 24 6-10 3 6 4-7 7 11h-5l-3-5-3 5h-4l-2 3h-3Z" fill="currentColor"/>
            </svg>
            <span><strong>RIDE</strong><small>ADDIS</small></span>
          </div>
          <button className="mobile-close-btn" onClick={onClose} aria-label="Close navigation">
            <X size={22} />
          </button>
        </div>

        {/* Note: Removed the top strip with Track Order / Watchlist as requested by user */}

        {/* Accordion Navigation (CycleSouq Mega-Menu Style) */}
        <nav className="mobile-nav-accordion">
          {/* 1. BICYCLES ACCORDION */}
          <div className={`accordion-group ${expandedSection === 'bikes' ? 'is-expanded' : ''}`}>
            <button
              className="accordion-trigger"
              onClick={() => toggleSection('bikes')}
            >
              <span>BICYCLES</span>
              <ChevronDown size={16} className="accordion-chevron" />
            </button>
            {expandedSection === 'bikes' && (
              <div className="accordion-submenu">
                <button onClick={() => handleSubItemClick('category', 'All')}>
                  <span>All Bicycles</span>
                  <ChevronRight size={14} />
                </button>
                <button onClick={() => handleSubItemClick('category', 'Road bikes')}>
                  <span>Road & Speed Bikes (Bishoftu)</span>
                  <ChevronRight size={14} />
                </button>
                <button onClick={() => handleSubItemClick('category', 'Mountain bikes')}>
                  <span>Mountain / 29er Trail (Entoto)</span>
                  <ChevronRight size={14} />
                </button>
                <button onClick={() => handleSubItemClick('category', 'City bikes')}>
                  <span>City & Commuter Bikes</span>
                  <ChevronRight size={14} />
                </button>
                <button onClick={() => handleSubItemClick('category', 'Kids bikes')}>
                  <span>Kids & Youth (Ages 6-13)</span>
                  <ChevronRight size={14} />
                </button>
                <button onClick={() => handleSubItemClick('category', 'Electric bikes')}>
                  <span>Electric Trail & Urban E-Bikes</span>
                  <ChevronRight size={14} />
                </button>
                <button onClick={() => handleSubItemClick('category', 'Utility bikes')}>
                  <span>Cargo & Heavy Utility</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* 2. ACCESSORIES & GEAR */}
          <div className={`accordion-group ${expandedSection === 'accessories' ? 'is-expanded' : ''}`}>
            <button
              className="accordion-trigger"
              onClick={() => toggleSection('accessories')}
            >
              <span>ACCESSORIES & GEAR</span>
              <ChevronDown size={16} className="accordion-chevron" />
            </button>
            {expandedSection === 'accessories' && (
              <div className="accordion-submenu">
                <button onClick={() => handleSubItemClick('category', 'Helmets')}>
                  <span>Helmets & MIPS Protection</span>
                  <ChevronRight size={14} />
                </button>
                <button onClick={() => handleSubItemClick('category', 'Locks & Lights')}>
                  <span>High-Lumen Lights & U-Locks</span>
                  <ChevronRight size={14} />
                </button>
                <button onClick={() => handleSubItemClick('category', 'Pumps & Tools')}>
                  <span>Track Pumps & Workshop Multi-tools</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* 3. TOP BRANDS */}
          <div className={`accordion-group ${expandedSection === 'brands' ? 'is-expanded' : ''}`}>
            <button
              className="accordion-trigger"
              onClick={() => toggleSection('brands')}
            >
              <span>TOP BRANDS</span>
              <ChevronDown size={16} className="accordion-chevron" />
            </button>
            {expandedSection === 'brands' && (
              <div className="accordion-submenu">
                <button onClick={() => handleSubItemClick('brand', 'All brands')}>
                  <span>All Brands</span>
                  <ChevronRight size={14} />
                </button>
                <button onClick={() => handleSubItemClick('brand', 'Ride Addis')}>
                  <span>Ride Addis Custom (Ethiopia)</span>
                  <ChevronRight size={14} />
                </button>
                <button onClick={() => handleSubItemClick('brand', 'Trek')}>
                  <span>Trek Bicycles</span>
                  <ChevronRight size={14} />
                </button>
                <button onClick={() => handleSubItemClick('brand', 'Giant')}>
                  <span>Giant Manufacturing</span>
                  <ChevronRight size={14} />
                </button>
                <button onClick={() => handleSubItemClick('brand', 'Specialized')}>
                  <span>Specialized S-Works</span>
                  <ChevronRight size={14} />
                </button>
                <button onClick={() => handleSubItemClick('brand', 'Cannondale')}>
                  <span>Cannondale</span>
                  <ChevronRight size={14} />
                </button>
                <button onClick={() => handleSubItemClick('brand', 'Abus')}>
                  <span>ABUS Germany</span>
                  <ChevronRight size={14} />
                </button>
                <button onClick={() => handleSubItemClick('brand', 'Knog')}>
                  <span>Knog Security</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* 4. WORKSHOP & SIZING */}
          <div className={`accordion-group ${expandedSection === 'services' ? 'is-expanded' : ''}`}>
            <button
              className="accordion-trigger"
              onClick={() => toggleSection('services')}
            >
              <span>WORKSHOP & FIT LAB</span>
              <ChevronDown size={16} className="accordion-chevron" />
            </button>
            {expandedSection === 'services' && (
              <div className="accordion-submenu">
                <button
                  onClick={() => {
                    onClose()
                    onOpenBikeFinder()
                  }}
                >
                  <span><Sparkles size={14} /> Find My Bike (Sizing Quiz)</span>
                  <ChevronRight size={14} />
                </button>
                <a
                  href="#service"
                  onClick={onClose}
                  className="submenu-link"
                >
                  <span>Addis Ababa Workshop & Fit Studio</span>
                  <ChevronRight size={14} />
                </a>
              </div>
            )}
          </div>

        </nav>

        {/* Footer Language and Account Status */}
        <div className="mobile-menu-footer">
          <div className="lang-currency-row">
            <button className="lang-pill" onClick={onToggleLanguage}>
              Language: <strong>{language === 'EN' ? 'English (EN)' : 'አማርኛ (AM)'}</strong>
            </button>
            <span className="currency-pill">ETB (ብር)</span>
          </div>
          <button
            className="mobile-account-btn"
            onClick={() => {
              onClose()
              onOpenAccount()
            }}
          >
            <UserRound size={15} />
            <span>{isLoggedIn ? `Account: ${userName}` : 'Sign In / Register'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
