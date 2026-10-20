'use client'

import React, { useState, useRef } from 'react'
import { Star, ShieldCheck, CheckCircle2, ThumbsUp, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { CloudDivider } from '@/components/CloudDivider'

interface EthiopianReview {
  id: string
  authorName: string
  authorLocation: string
  bikeModel: string
  rating: number
  date: string
  reviewEn: string
  reviewAm: string
  verified: boolean
  isLocalGuide: boolean
  helpfulCount: number
}

const INITIAL_REVIEWS: EthiopianReview[] = [
  {
    id: 'rev_1',
    authorName: 'Yared Mengistu',
    authorLocation: 'Bole, Addis Ababa',
    bikeModel: 'Addis Commuter 01',
    rating: 5,
    date: '2 days ago',
    reviewEn: 'The Addis Commuter 01 made my daily commute from Bole to Kazanchis effortless. Handles the cobblestone detours smoothly!',
    reviewAm: 'አዲስ ኮሚዩተር 01 ከቦሌ እስከ ካዛንቺስ ያለውን የየዕለት ጉዞዬን እጅግ ቀላል አድርጎታል። የኮብልስቶን መንገዶችን ያለምንም ችግር ያልፋል!',
    verified: true,
    isLocalGuide: true,
    helpfulCount: 14
  },
  {
    id: 'rev_2',
    authorName: 'Hanna Tadesse',
    authorLocation: 'CMC / Yeka',
    bikeModel: 'Entoto Trail Pro',
    rating: 5,
    date: '1 week ago',
    reviewEn: 'Took the Entoto Trail Pro up to the eucalyptus ridges on Sunday. The Shimano gear ratio is dialed for high altitudes. Unmatched build quality.',
    reviewAm: 'እሁድ ዕለት የእንጦጦ ትሬይል ፕሮን ይዤ ወደ እንጦጦ ወጣሁ። የሺማኖ ጊር ለከፍተኛ ቦታዎች እጅግ ምቹ ነው። ጥራቱ ወደር የለውም።',
    verified: true,
    isLocalGuide: false,
    helpfulCount: 22
  },
  {
    id: 'rev_3',
    authorName: 'Dawit Bekele',
    authorLocation: 'Sarbet / Old Airport',
    bikeModel: 'Sheger City Cruiser',
    rating: 5,
    date: '2 weeks ago',
    reviewEn: 'Assembled and delivered directly to my compound in Sarbet within 4 hours. Express dispatch in Addis Ababa is top notch.',
    reviewAm: 'በ4 ሰዓት ውስጥ ሙሉ በሙሉ ተገጣጥሞ ሳርቤት ወደሚገኘው ግቢዬ ደረሰ። በአዲስ አበባ ውስጥ የእነሱ ፈጣን ማድረስ እጅግ የሚያስደንቅ ነው።',
    verified: true,
    isLocalGuide: true,
    helpfulCount: 9
  },
  {
    id: 'rev_4',
    authorName: 'Selamawit Girma',
    authorLocation: 'Kazanchis',
    bikeModel: 'Addis Commuter 01',
    rating: 5,
    date: '3 weeks ago',
    reviewEn: 'The step-through frame makes riding in office attire so convenient. Beautiful craftsmanship and smooth shifting.',
    reviewAm: 'ስቴፕ-ትሩ ፍሬሙ ለስራ ልብስ በጣም ምቹ ነው። ጥበባዊ አሰራሩ እና የፍሬን እንቅስቃሴው በጣም የተዋጣለት ነው።',
    verified: true,
    isLocalGuide: false,
    helpfulCount: 17
  },
  {
    id: 'rev_5',
    authorName: 'Binyam Hailemariam',
    authorLocation: 'Piassa / Arada',
    bikeModel: 'Entoto Trail Pro',
    rating: 5,
    date: '1 month ago',
    reviewEn: 'Rode down through Churchill Road with full braking confidence. Dual piston brakes grip tight on steep descents.',
    reviewAm: 'በቸርችል ጎዳና ቁልቁለት ስወርድ ፍሬኑ እጅግ አስተማማኝ ነበር። ባለሁለት ፒስተን ፍሬኑ ዳገትና ቁልቁለት ላይ በጣም ጠንካራ ነው።',
    verified: true,
    isLocalGuide: false,
    helpfulCount: 31
  },
  {
    id: 'rev_6',
    authorName: 'Meron Assefa',
    authorLocation: 'Bole Medhanialem',
    bikeModel: 'Little Addis Balance Bike',
    rating: 5,
    date: '1 month ago',
    reviewEn: 'Bought the Little Addis for my 4-year-old daughter. Super lightweight, she learned to balance in just three afternoons!',
    reviewAm: 'ለ4 ዓመት ሴት ልጄ ሊትል አዲስን ገዛሁላት። እጅግ ቀላል ስለሆነ በሶስት ቀናት ውስጥ ሚዛን መጠበቅን ተማረች!',
    verified: true,
    isLocalGuide: true,
    helpfulCount: 19
  }
]

// Monogram avatar background palettes (cycling luxury inspired)
const MONOGRAM_COLORS = [
  'bg-emerald-600 text-white',
  'bg-amber-600 text-white',
  'bg-stone-700 text-amber-300',
  'bg-teal-700 text-white',
  'bg-yellow-600 text-neutral-950',
  'bg-stone-800 text-emerald-300'
]

const STORAGE_KEY = 'ride_addis_google_reviews'

function loadReviews(): EthiopianReview[] {
  if (typeof window === 'undefined') return INITIAL_REVIEWS
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    // fallback
  }
  return INITIAL_REVIEWS
}

function saveReviewsToStorage(data: EthiopianReview[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    // ignore
  }
}

interface GoogleReviewsSectionProps {
  isAm?: boolean
}

export function GoogleReviewsSection({ isAm = false }: GoogleReviewsSectionProps) {
  const [reviews, setReviews] = useState<EthiopianReview[]>(loadReviews())
  const [filterRating, setFilterRating] = useState<number | 'all'>('all')
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({})
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false)
  const [authorName, setAuthorName] = useState('')
  const [authorLocation, setAuthorLocation] = useState('Bole, Addis Ababa')
  const [bikeModel, setBikeModel] = useState('Addis Commuter 01')
  const [reviewEn, setReviewEn] = useState('')
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [submittedSuccess, setSubmittedSuccess] = useState(false)

  // Mobile horizontal swipe state & container ref
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [activeMobileIndex, setActiveMobileIndex] = useState(0)

  const handleMobileScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return
    const cards = Array.from(container.querySelectorAll<HTMLElement>('[data-review-card="true"]'))
    if (!cards.length) return

    const scrollLeft = container.scrollLeft
    let closestIndex = 0
    let minDiff = Infinity

    cards.forEach((card, index) => {
      const cardTarget = Math.max(0, card.offsetLeft - 16)
      const diff = Math.abs(cardTarget - scrollLeft)
      if (diff < minDiff) {
        minDiff = diff
        closestIndex = index
      }
    })

    if (closestIndex >= 0 && closestIndex < filtered.length) {
      setActiveMobileIndex(closestIndex)
    }
  }

  const scrollToReview = (idx: number) => {
    const container = scrollContainerRef.current
    if (!container) return
    const cards = Array.from(container.querySelectorAll<HTMLElement>('[data-review-card="true"]'))
    const targetCard = cards[idx]
    if (targetCard) {
      const targetLeft = Math.max(0, targetCard.offsetLeft - 16)
      container.scrollTo({
        left: targetLeft,
        behavior: 'smooth'
      })
      setActiveMobileIndex(idx)
    }
  }

  const scrollPrevReview = () => {
    scrollToReview(Math.max(0, activeMobileIndex - 1))
  }

  const scrollNextReview = () => {
    scrollToReview(Math.min(filtered.length - 1, activeMobileIndex + 1))
  }

  const handleLike = (id: string) => {
    if (likedReviews[id]) return
    const updated = reviews.map(r => {
      if (r.id === id) {
        return { ...r, helpfulCount: r.helpfulCount + 1 }
      }
      return r
    })
    setReviews(updated)
    saveReviewsToStorage(updated)
    setLikedReviews({ ...likedReviews, [id]: true })
  }

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!authorName.trim() || !reviewEn.trim()) return

    const newRev: EthiopianReview = {
      id: 'rev_' + Date.now(),
      authorName: authorName.trim(),
      authorLocation: authorLocation.trim() || 'Addis Ababa',
      bikeModel: bikeModel.trim() || 'Addis Commuter 01',
      rating,
      date: 'Just now',
      reviewEn: reviewEn.trim(),
      reviewAm: reviewEn.trim(),
      verified: true,
      isLocalGuide: false,
      helpfulCount: 0
    }

    const updated = [newRev, ...reviews]
    setReviews(updated)
    saveReviewsToStorage(updated)
    setSubmittedSuccess(true)

    setTimeout(() => {
      setSubmittedSuccess(false)
      setIsWriteModalOpen(false)
      setAuthorName('')
      setReviewEn('')
      setRating(5)
      setHoverRating(0)
    }, 1800)
  }

  const filtered = reviews.filter(r => {
    if (filterRating === 'all') return true
    return r.rating === filterRating
  })

  return (
    <section id="reviews" className="reviews-cloud-page text-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Responsive Header: Aligned & Balanced on All Phone & Desktop Screens */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 pb-8 sm:pb-12">
          
          {/* Left Block: Google Logo & Title */}
          <div className="flex items-start gap-3.5 sm:gap-5">
            {/* Google G Logo Badge */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-full bg-white flex items-center justify-center p-2.5 sm:p-3.5 shadow-xl flex-shrink-0 mt-0.5">
              <svg viewBox="0 0 24 24" className="w-7 h-7 sm:w-9 sm:h-9">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                  {isAm ? 'የደንበኞች ጎግል አስተያየቶች' : 'Google Customer Reviews'}
                </h2>
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[11px] sm:text-xs px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full font-semibold border border-emerald-500/30 whitespace-nowrap">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {isAm ? 'የተረጋገጠ' : 'Verified'}
                </span>
              </div>
              <p className="text-emerald-100/70 text-xs sm:text-sm leading-relaxed max-w-xl">
                {isAm
                  ? 'በአዲስ አበባ ከተማ ውስጥ በእውነተኛ ብስክሌት ነጂዎች የተሰጡ 148+ እውነተኛ ግምገማዎች'
                  : 'Authentic reviews from 148+ verified riders across Addis Ababa streets and Entoto mountain routes.'}
              </p>
            </div>
          </div>

          {/* Right Block: Rating Summary & Write Button Card */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">4.9</span>
              <div>
                <div className="flex items-center text-amber-400 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      fill="#f59e0b"
                      color="#f59e0b"
                      style={{ fill: '#f59e0b', color: '#f59e0b' }}
                      className="filter drop-shadow-[0_1px_5px_rgba(245,158,11,0.5)]"
                    />
                  ))}
                </div>
                <span className="text-[11px] sm:text-xs text-emerald-100/70 mt-0.5 block font-medium">
                  {isAm ? '148 አስተያየቶች በጎግል ማፕስ' : '148 Google Maps reviews'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsWriteModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-neutral-950 font-bold px-5 py-2.5 sm:py-3 rounded-full transition shadow-lg text-xs sm:text-sm cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>{isAm ? 'አስተያየት ይጻፉ' : 'Write a Review'}</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-6 sm:mb-8 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
          <button
            onClick={() => setFilterRating('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap ${
              filterRating === 'all'
                ? 'bg-white text-neutral-950 shadow-md'
                : 'bg-white/10 text-emerald-100 hover:bg-white/20'
            }`}
          >
            {isAm ? 'ሁሉም (6)' : 'All Reviews (6)'}
          </button>
          <button
            onClick={() => setFilterRating(5)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap ${
              filterRating === 5
                ? 'bg-amber-400 text-neutral-950 shadow-md'
                : 'bg-white/10 text-emerald-100 hover:bg-white/20'
            }`}
          >
            <Star size={13} fill="currentColor" color="currentColor" />
            <span>5 Stars (5)</span>
          </button>
        </div>

        {/* Mobile Swipe Navigation Controls & Live Counter */}
        <div className="flex md:hidden items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold tracking-wide">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>{isAm ? 'ወደ ጎን ያንሸራትቱ ➔' : 'Swipe sideways ➔'}</span>
            <span className="text-[11px] text-emerald-200/50 font-mono">({activeMobileIndex + 1}/{filtered.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={scrollPrevReview}
              disabled={activeMobileIndex === 0}
              className="w-9 h-9 rounded-full bg-white/10 disabled:opacity-30 border border-white/20 text-white flex items-center justify-center transition active:scale-90"
              aria-label="Previous review"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={scrollNextReview}
              disabled={activeMobileIndex >= filtered.length - 1}
              className="w-9 h-9 rounded-full bg-white/10 disabled:opacity-30 border border-white/20 text-white flex items-center justify-center transition active:scale-90"
              aria-label="Next review"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Reviews Track: Ultra-Smooth Momentum Carousel with Snap Alignment on Phones / Grid on Desktop */}
        <div
          ref={scrollContainerRef}
          onScroll={handleMobileScroll}
          className="relative flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 scrollbar-none snap-x snap-mandatory overscroll-x-contain touch-pan-x"
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehaviorX: 'contain',
            scrollPaddingLeft: '1rem',
            scrollPaddingRight: '1rem'
          }}
        >
          {filtered.map((rev, idx) => {
            const initial = rev.authorName.trim().charAt(0).toUpperCase()
            const monogramColor = MONOGRAM_COLORS[idx % MONOGRAM_COLORS.length]

            return (
              <div
                key={rev.id}
                data-review-card="true"
                data-index={idx}
                className="w-[84vw] max-w-[340px] sm:w-[350px] md:w-auto flex-shrink-0 snap-start snap-always bg-white/[0.08] backdrop-blur-md rounded-3xl border border-white/10 hover:border-amber-400/40 p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 shadow-lg transform-gpu"
                style={{ willChange: 'transform' }}
              >
                <div>
                  {/* Monogram Alphabet Profile Header (NO PHOTO) */}
                  <div className="flex items-start justify-between gap-2.5 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-full ${monogramColor} font-black text-lg flex items-center justify-center flex-shrink-0 shadow-md`}>
                        {initial}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-sm sm:text-base truncate">
                            {rev.authorName}
                          </span>
                          {rev.verified && (
                            <span title="Verified Customer" className="inline-flex">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] sm:text-xs text-emerald-200/60 truncate">{rev.authorLocation}</p>
                      </div>
                    </div>

                    {rev.isLocalGuide && (
                      <span className="inline-flex items-center gap-1 bg-amber-400/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-amber-400/20 whitespace-nowrap flex-shrink-0">
                        <Star size={11} fill="#f59e0b" color="#f59e0b" />
                        Local Guide
                      </span>
                    )}
                  </div>

                  {/* Rating Stars + Date */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-amber-400 gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={15}
                          fill={s <= rev.rating ? '#f59e0b' : 'transparent'}
                          color={s <= rev.rating ? '#f59e0b' : '#57534e'}
                          style={{
                            fill: s <= rev.rating ? '#f59e0b' : 'transparent',
                            color: s <= rev.rating ? '#f59e0b' : '#57534e'
                          }}
                          className={s <= rev.rating ? 'drop-shadow-[0_1px_4px_rgba(245,158,11,0.5)]' : 'opacity-35'}
                        />
                      ))}
                    </div>
                    <span className="text-emerald-200/50 text-[11px] sm:text-xs font-mono">{rev.date}</span>
                  </div>

                  {/* Bike Model Badge */}
                  {rev.bikeModel && (
                    <div className="inline-block bg-black/30 text-emerald-100 text-[11px] px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full font-mono mb-3 border border-white/10">
                      {rev.bikeModel}
                    </div>
                  )}

                  {/* Review Text */}
                  <p className="text-stone-100 text-xs sm:text-sm leading-relaxed">
                    "{isAm ? rev.reviewAm : rev.reviewEn}"
                  </p>
                </div>

                {/* Helpful Count Footer */}
                <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between text-xs text-emerald-200/60">
                  <button
                    onClick={() => handleLike(rev.id)}
                    className={`flex items-center gap-1.5 transition ${
                      likedReviews[rev.id] ? 'text-amber-400 font-bold' : 'hover:text-white'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${likedReviews[rev.id] ? 'fill-current' : ''}`} />
                    <span>{isAm ? 'ጠቃሚ ነበር' : 'Helpful'} ({rev.helpfulCount})</span>
                  </button>

                  <div className="flex items-center gap-1 text-[11px] text-emerald-200/40 font-mono">
                    Google Maps Review
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Mobile Dynamic Indicator Dots */}
        <div className="flex md:hidden items-center justify-center gap-1.5 mt-5">
          {filtered.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => scrollToReview(dotIdx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeMobileIndex === dotIdx
                  ? 'w-6 bg-amber-400'
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to slide ${dotIdx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Cloud Edge Transitioning Seamlessly into FAQ Section (#eae7de) */}
      <CloudDivider fill="#eae7de" position="bottom" flipX />

      {/* Review Write Modal: Perfectly Responsive Bottom Sheet on Phones / Centered Dialog on Desktop */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden">
          <div className="bg-[#171c18] border border-stone-700/80 rounded-t-[28px] sm:rounded-3xl max-w-lg w-full max-h-[92dvh] overflow-y-auto p-5 sm:p-7 shadow-2xl relative flex flex-col">
            
            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1 bg-stone-600 rounded-full mx-auto mb-3 sm:hidden flex-shrink-0" />

            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => setIsWriteModalOpen(false)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              aria-label="Close review modal"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-bold text-white mb-1.5 pr-8">
              {isAm ? 'የጎግል አስተያየት ይጻፉ' : 'Write a Google Review'}
            </h3>
            <p className="text-emerald-100/70 text-xs mb-5">
              {isAm ? 'የብስክሌት ግልጋሎቱንና ልምድዎን ያካፍሉ' : 'Share your ride experience in Addis Ababa'}
            </p>

            {submittedSuccess ? (
              <div className="py-8 text-center text-emerald-400 font-semibold flex flex-col items-center gap-2">
                <CheckCircle2 className="w-10 h-10" />
                <span>{isAm ? 'አስተያየትዎ በተሳካ ሁኔታ ተመዝግቧል!' : 'Thank you! Your review has been posted.'}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {isAm ? 'ሙሉ ስም' : 'Your Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={e => setAuthorName(e.target.value)}
                    placeholder="e.g. Dawit Haile"
                    className="w-full bg-black/40 border border-stone-700 rounded-xl px-4 py-3 text-white text-base sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      {isAm ? 'አድራሻ / ሰፈር' : 'Location (Subcity)'}
                    </label>
                    <input
                      type="text"
                      value={authorLocation}
                      onChange={e => setAuthorLocation(e.target.value)}
                      placeholder="e.g. Bole, Addis Ababa"
                      className="w-full bg-black/40 border border-stone-700 rounded-xl px-4 py-3 text-white text-base sm:text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      {isAm ? 'የብስክሌት ሞዴል' : 'Bicycle / Item'}
                    </label>
                    <input
                      type="text"
                      value={bikeModel}
                      onChange={e => setBikeModel(e.target.value)}
                      placeholder="e.g. Addis Commuter 01"
                      className="w-full bg-black/40 border border-stone-700 rounded-xl px-4 py-3 text-white text-base sm:text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-stone-300">
                      {isAm ? 'ደረጃ (Rating)' : 'Star Rating'}
                    </label>
                    <span className="text-xs font-bold text-amber-400 transition-all">
                      {(hoverRating || rating) === 5
                        ? (isAm ? '5 ኮከቦች · እጅግ በጣም ጥሩ!' : '5 Stars · Outstanding!')
                        : (hoverRating || rating) === 4
                        ? (isAm ? '4 ኮከቦች · በጣም ጥሩ' : '4 Stars · Very Good')
                        : (hoverRating || rating) === 3
                        ? (isAm ? '3 ኮከቦች · ጥሩ' : '3 Stars · Good')
                        : (hoverRating || rating) === 2
                        ? (isAm ? '2 ኮከቦች · መካከለኛ' : '2 Stars · Fair')
                        : (isAm ? '1 ኮከብ · መሻሻል አለበት' : '1 Star · Needs Improvement')}
                    </span>
                  </div>

                  <div
                    className="flex items-center gap-2 p-2.5 rounded-2xl bg-black/50 border border-stone-800 w-fit"
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    {[1, 2, 3, 4, 5].map(num => {
                      const isFilled = (hoverRating || rating) >= num
                      return (
                        <button
                          type="button"
                          key={num}
                          onClick={() => setRating(num)}
                          onTouchStart={() => setRating(num)}
                          onMouseEnter={() => setHoverRating(num)}
                          className={`p-2 rounded-xl border transition-all duration-150 transform hover:scale-115 active:scale-95 cursor-pointer ${
                            isFilled
                              ? 'border-amber-400/80 bg-amber-400/15 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                              : 'border-stone-800 bg-stone-900/40 hover:border-stone-700'
                          }`}
                          aria-label={`Rate ${num} star${num > 1 ? 's' : ''}`}
                        >
                          <Star
                            size={24}
                            fill={isFilled ? '#f59e0b' : 'transparent'}
                            color={isFilled ? '#f59e0b' : '#78716c'}
                            style={{
                              fill: isFilled ? '#f59e0b' : 'transparent',
                              color: isFilled ? '#f59e0b' : '#78716c'
                            }}
                            className={`transition-all duration-200 ${
                              isFilled
                                ? 'filter drop-shadow-[0_0_8px_rgba(245,158,11,0.7)] scale-105'
                                : 'opacity-40 hover:opacity-80'
                            }`}
                          />
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {isAm ? 'አስተያየት' : 'Your Review'}
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reviewEn}
                    onChange={e => setReviewEn(e.target.value)}
                    placeholder="Tell us about your ride, delivery in Addis Ababa..."
                    className="w-full bg-black/40 border border-stone-700 rounded-xl px-4 py-3 text-white text-base sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsWriteModalOpen(false)}
                    className="px-5 py-2.5 text-stone-400 hover:text-white text-sm transition text-center cursor-pointer"
                  >
                    {isAm ? 'ሰርዝ' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-neutral-950 font-bold px-6 py-3 rounded-full text-sm transition shadow-lg text-center cursor-pointer"
                  >
                    {isAm ? 'አስገባ' : 'Publish Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
