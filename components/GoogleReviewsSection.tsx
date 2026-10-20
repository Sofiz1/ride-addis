'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Star, CheckCircle2, ThumbsUp, Plus, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import { EthiopianReview, loadReviews, saveReviews } from '@/lib/store'
import { CloudDivider } from '@/components/CloudDivider'

interface GoogleReviewsSectionProps {
  isAm?: boolean
}

// Curated avatar accent colors for first-name monograms
const MONOGRAM_COLORS = [
  'bg-amber-500 text-neutral-950',
  'bg-emerald-500 text-neutral-950',
  'bg-orange-500 text-neutral-950',
  'bg-yellow-500 text-neutral-950',
  'bg-lime-500 text-neutral-950',
  'bg-teal-500 text-neutral-950'
]

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
  const [submittedSuccess, setSubmittedSuccess] = useState(false)

  // Mobile horizontal swipe state & container ref
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [activeMobileIndex, setActiveMobileIndex] = useState(0)

  const handleMobileScroll = () => {
    if (!scrollContainerRef.current) return
    const { scrollLeft, clientWidth } = scrollContainerRef.current
    if (clientWidth > 0) {
      const idx = Math.round(scrollLeft / (clientWidth * 0.85))
      setActiveMobileIndex(Math.max(0, idx))
    }
  }

  const scrollToReview = (idx: number) => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const cardWidth = container.clientWidth * 0.85 + 16
    container.scrollTo({
      left: idx * cardWidth,
      behavior: 'smooth'
    })
    setActiveMobileIndex(idx)
  }

  const scrollPrevReview = () => {
    scrollToReview(Math.max(0, activeMobileIndex - 1))
  }

  const scrollNextReview = () => {
    scrollToReview(activeMobileIndex + 1)
  }

  // Realtime Load: Fetch reviews from database on mount
  useEffect(() => {
    let isMounted = true
    const loadRealtimeReviews = async () => {
      try {
        const res = await fetch('/api/reviews')
        if (res.ok) {
          const json = await res.json()
          if (json.success && Array.isArray(json.data) && json.data.length > 0 && isMounted) {
            setReviews(json.data)
            saveReviews(json.data)
          }
        }
      } catch (e) {
        console.error('Error fetching live reviews from database:', e)
      }
    }
    loadRealtimeReviews()
    return () => {
      isMounted = false
    }
  }, [])

  const handleLike = async (id: string) => {
    if (likedReviews[id]) return
    setLikedReviews(prev => ({ ...prev, [id]: true }))
    
    // Find current helpful count and increment
    const currentRev = reviews.find(r => r.id === id)
    const newCount = (currentRev?.helpfulCount || 0) + 1

    const updated = reviews.map(r => (r.id === id ? { ...r, helpfulCount: newCount } : r))
    setReviews(updated)
    saveReviews(updated)

    // Save realtime in database
    try {
      await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          helpfulCount: newCount
        })
      })
    } catch (e) {
      console.error('Error saving review like in database:', e)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!authorName.trim() || !reviewEn.trim()) return

    const newRev: EthiopianReview = {
      id: 'rev-' + Date.now(),
      authorName: authorName.trim(),
      authorLocation: authorLocation || 'Addis Ababa, Ethiopia',
      authorAvatar: '',
      rating,
      date: 'Just now',
      verified: true,
      isLocalGuide: true,
      bikeModel,
      reviewEn: reviewEn.trim(),
      reviewAm: reviewEn.trim(),
      helpfulCount: 0,
      isFeatured: true
    }

    const updated = [newRev, ...reviews]
    setReviews(updated)
    saveReviews(updated)
    setSubmittedSuccess(true)

    // Save realtime in database
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRev)
      })
    } catch (e) {
      console.error('Error saving review to database:', e)
    }

    setTimeout(() => {
      setIsWriteModalOpen(false)
      setSubmittedSuccess(false)
      setAuthorName('')
      setReviewEn('')
    }, 1500)
  }

  const filtered = reviews.filter(r => {
    if (filterRating === 'all') return true
    return r.rating === filterRating
  })

  return (
    <section id="reviews" className="reviews-cloud-page text-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Seamless Header Sitting Directly on Cloud Page Canvas - NO RECTANGLE CARD */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
            
            {/* Google G Logo Badge */}
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center p-3.5 shadow-xl flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-9 h-9">
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

            <div>
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {isAm ? 'የደንበኞች ጎግል አስተያየቶች' : 'Google Customer Reviews'}
                </h2>
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full font-semibold border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isAm ? 'የተረጋገጠ' : 'Verified'}
                </span>
              </div>
              <p className="text-emerald-100/70 text-xs sm:text-sm mt-1 max-w-xl">
                {isAm
                  ? 'በአዲስ አበባ ከተማ ውስጥ በእውነተኛ ብስክሌት ነጂዎች የተሰጡ 148+ እውነተኛ ግምገማዎች'
                  : 'Authentic reviews from 148+ verified riders across Addis Ababa streets and Entoto mountain routes.'}
              </p>
            </div>
          </div>

          {/* Rating Summary & Write Button */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-4xl sm:text-5xl font-black text-white">4.9</span>
              <div>
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400" />
                  ))}
                </div>
                <span className="text-xs text-emerald-100/60 mt-0.5 block font-medium">
                  {isAm ? '148 አስተያየቶች በጎግል ማፕስ' : '148 Google Maps reviews'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsWriteModalOpen(true)}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-5 py-2.5 rounded-full transition shadow-lg text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4" />
              {isAm ? 'አስተያየት ይጻፉ' : 'Write a Review'}
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
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
            className={`flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap ${
              filterRating === 5
                ? 'bg-amber-400 text-neutral-950 shadow-md'
                : 'bg-white/10 text-emerald-100 hover:bg-white/20'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            5 Stars (5)
          </button>
        </div>

        {/* Mobile Swipe Navigation Controls & Hint */}
        <div className="flex md:hidden items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold tracking-wide">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>{isAm ? 'ወደ ጎን ያንሸራትቱ ➔' : 'Swipe sideways ➔'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={scrollPrevReview}
              disabled={activeMobileIndex === 0}
              className="w-8 h-8 rounded-full bg-white/10 disabled:opacity-30 border border-white/20 text-white flex items-center justify-center transition active:scale-90"
              aria-label="Previous review"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={scrollNextReview}
              disabled={activeMobileIndex >= filtered.length - 1}
              className="w-8 h-8 rounded-full bg-white/10 disabled:opacity-30 border border-white/20 text-white flex items-center justify-center transition active:scale-90"
              aria-label="Next review"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Reviews Track: Smooth Horizontal Side-Scroll on Phones / 3-Col Grid on Desktop */}
        <div
          ref={scrollContainerRef}
          onScroll={handleMobileScroll}
          className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none scroll-smooth touch-pan-x"
        >
          {filtered.map((rev, idx) => {
            const initial = rev.authorName.trim().charAt(0).toUpperCase()
            const monogramColor = MONOGRAM_COLORS[idx % MONOGRAM_COLORS.length]

            return (
              <div
                key={rev.id}
                className="w-[85vw] sm:w-[360px] md:w-auto flex-shrink-0 snap-center bg-white/[0.07] backdrop-blur-md rounded-[2.2rem] md:rounded-[2.5rem] border border-white/10 hover:border-amber-400/40 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 shadow-lg"
              >
                <div>
                  {/* Monogram Alphabet Profile Header (NO PHOTO) */}
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-full ${monogramColor} font-black text-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                        {initial}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-base">
                            {rev.authorName}
                          </span>
                          {rev.verified && (
                            <span title="Verified Customer">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-emerald-200/60">{rev.authorLocation}</p>
                      </div>
                    </div>

                    {rev.isLocalGuide && (
                      <span className="inline-flex items-center gap-1 bg-amber-400/10 text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/20 whitespace-nowrap">
                        <Star className="w-3 h-3 fill-amber-400" />
                        Local Guide
                      </span>
                    )}
                  </div>

                  {/* Rating Stars + Date */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="flex items-center text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-emerald-200/50 text-xs font-mono">{rev.date}</span>
                  </div>

                  {/* Bike Model Badge */}
                  {rev.bikeModel && (
                    <div className="inline-block bg-black/30 text-emerald-100 text-[11px] px-3 py-1 rounded-full font-mono mb-3.5 border border-white/10">
                      {rev.bikeModel}
                    </div>
                  )}

                  {/* Review Text */}
                  <p className="text-stone-100 text-sm leading-relaxed">
                    "{isAm ? rev.reviewAm : rev.reviewEn}"
                  </p>
                </div>

                {/* Helpful Count Footer */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-emerald-200/60">
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

      {/* Review Write Modal */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1b221c] border border-stone-700 rounded-3xl max-w-lg w-full p-7 shadow-2xl relative">
            <h3 className="text-xl font-bold text-white mb-2">
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
                    className="w-full bg-black/40 border border-stone-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      {isAm ? 'አድራሻ / ሰፈር' : 'Location (Subcity)'}
                    </label>
                    <input
                      type="text"
                      value={authorLocation}
                      onChange={e => setAuthorLocation(e.target.value)}
                      placeholder="e.g. Bole, Addis Ababa"
                      className="w-full bg-black/40 border border-stone-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
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
                      className="w-full bg-black/40 border border-stone-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {isAm ? 'ደረጃ (Rating)' : 'Star Rating'}
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setRating(num)}
                        className={`p-2 rounded-xl border transition ${
                          rating >= num
                            ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                            : 'border-stone-700 text-stone-600'
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                    <span className="text-xs text-stone-400 ml-2 font-semibold">
                      {rating} / 5 Stars
                    </span>
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
                    className="w-full bg-black/40 border border-stone-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsWriteModalOpen(false)}
                    className="px-5 py-2.5 text-stone-400 hover:text-white text-sm transition"
                  >
                    {isAm ? 'ሰርዝ' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-6 py-2.5 rounded-full text-sm transition"
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
