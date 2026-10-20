'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  MapPin,
  Phone,
  AlertTriangle,
  Package,
  ArrowRight,
  XCircle
} from 'lucide-react'
import { Order, loadOrdersFromStorage } from '@/lib/store'

interface OrderTrackerModalProps {
  isOpen: boolean
  onClose: () => void
  orders: Order[]
  initialOrderId?: string
}

export function OrderTrackerModal({
  isOpen,
  onClose,
  orders: propOrders,
  initialOrderId
}: OrderTrackerModalProps) {
  const [allOrders, setAllOrders] = useState<Order[]>([])
  const [searchId, setSearchId] = useState('')
  const [activeOrder, setActiveOrder] = useState<Order | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchMessage, setSearchMessage] = useState('')

  // Refresh and combine all orders from local storage, props, and live server API
  const refreshAllOrders = async () => {
    const local = loadOrdersFromStorage()
    const map = new Map<string, Order>()

    // Local storage orders first
    local.forEach((o) => {
      if (o && o.id) map.set(o.id.toLowerCase(), o)
    })

    // Props orders
    propOrders.forEach((o) => {
      if (o && o.id && !map.has(o.id.toLowerCase())) {
        map.set(o.id.toLowerCase(), o)
      }
    })

    // Fetch latest live orders from disk database
    try {
      const res = await fetch('/api/orders')
      if (res.ok) {
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          json.data.forEach((o: Order) => {
            if (o && o.id) map.set(o.id.toLowerCase(), o)
          })
        }
      }
    } catch {
      // Offline / fallback to local
    }

    const mergedList = Array.from(map.values()).sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0
      const dateB = b.date ? new Date(b.date).getTime() : 0
      return dateB - dateA
    })

    setAllOrders(mergedList)
    return mergedList
  }

  // Sync initial order or default to most recent placed order when modal opens
  useEffect(() => {
    if (!isOpen) return

    refreshAllOrders().then((list) => {
      const targetId =
        initialOrderId ||
        searchId ||
        list[0]?.id ||
        propOrders[0]?.id

      if (targetId) {
        setSearchId(targetId)
        doLookup(targetId, list)
      }
    })
  }, [isOpen, initialOrderId])

  // Real-time polling while tracker is open so customer sees admin changes instantly
  useEffect(() => {
    if (!isOpen) return

    const currentTargetId = searchId || initialOrderId || activeOrder?.id
    if (!currentTargetId) return

    const pollLiveOrder = async () => {
      try {
        // 1. Check local storage
        const allLocal = loadOrdersFromStorage()
        const localMatch = allLocal.find(
          (o) => o.id.toLowerCase() === currentTargetId.toLowerCase()
        )
        if (localMatch) {
          setActiveOrder((prev) => {
            if (
              !prev ||
              prev.status !== localMatch.status ||
              prev.paymentStatus !== localMatch.paymentStatus ||
              prev.declineReason !== localMatch.declineReason ||
              prev.eta !== localMatch.eta
            ) {
              return localMatch
            }
            return prev
          })
        }

        // 2. Fetch authoritative database from disk API
        const res = await fetch(`/api/orders?search=${encodeURIComponent(currentTargetId)}`)
        if (res.ok) {
          const json = await res.json()
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const serverOrder = json.data[0]
            setActiveOrder((prev) => {
              if (
                !prev ||
                prev.status !== serverOrder.status ||
                prev.paymentStatus !== serverOrder.paymentStatus ||
                prev.declineReason !== serverOrder.declineReason ||
                prev.eta !== serverOrder.eta ||
                prev.courierName !== serverOrder.courierName
              ) {
                return serverOrder
              }
              return prev
            })

            // Update item in allOrders list so badge stays in sync
            setAllOrders((prev) =>
              prev.map((o) =>
                o.id.toLowerCase() === serverOrder.id.toLowerCase() ? serverOrder : o
              )
            )
          }
        }
      } catch (err) {
        // Silent background poll
      }
    }

    const interval = setInterval(pollLiveOrder, 1500)
    const handleSync = () => {
      refreshAllOrders()
      pollLiveOrder()
    }

    window.addEventListener('storage', handleSync)
    window.addEventListener('order-updated', handleSync)

    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('order-updated', handleSync)
    }
  }, [isOpen, searchId, initialOrderId, activeOrder?.id])

  const doLookup = async (query: string, localList?: Order[]) => {
    const q = query.trim()
    if (!q) {
      setSearchMessage('Please enter an Order ID or phone number.')
      setActiveOrder(null)
      return
    }

    setIsSearching(true)
    setSearchMessage('')

    const list = localList || loadOrdersFromStorage()
    const qLower = q.toLowerCase()
    const qClean = q.replace(/[^0-9]/g, '')

    // Show local match immediately for instant response
    const localMatch = list.find(o =>
      o.id.toLowerCase() === qLower ||
      o.id.toLowerCase().replace(/[^a-z0-9]/g, '') === qLower.replace(/[^a-z0-9]/g, '') ||
      (qClean.length > 5 && (o.shippingAddress?.phone || '').replace(/[^0-9]/g, '').includes(qClean)) ||
      (o.transactionRef && o.transactionRef.toLowerCase() === qLower)
    )

    if (localMatch) {
      setActiveOrder(localMatch)
    }

    // Always fetch fresh authoritative state from server JSON database
    try {
      const res = await fetch(`/api/orders?search=${encodeURIComponent(q)}`)
      const json = await res.json()
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setActiveOrder(json.data[0])
        setSearchMessage('')
      } else if (!localMatch) {
        setActiveOrder(null)
        setSearchMessage(`No order found matching "${q}". Please check your Order ID or phone number.`)
      }
    } catch {
      if (!localMatch) {
        setActiveOrder(null)
        setSearchMessage(`Could not look up order. Please check your connection and try again.`)
      }
    } finally {
      setIsSearching(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    doLookup(searchId)
  }

  if (!isOpen) return null

  // Determine simple 3-stage status
  const isDeclined =
    activeOrder?.paymentStatus === 'rejected' ||
    activeOrder?.paymentStatus === 'declined' ||
    activeOrder?.status === 'declined'

  const isApproved =
    activeOrder?.paymentStatus === 'paid' ||
    activeOrder?.paymentStatus === 'approved'

  const isPendingReview =
    !isDeclined && !isApproved

  // Current stage: 1 = Approved, 2 = On the Way, 3 = Delivered
  let liveStep = 1
  if (activeOrder?.status === 'delivered') {
    liveStep = 3
  } else if (
    activeOrder?.status === 'on_the_way' ||
    activeOrder?.status === 'out_for_delivery' ||
    activeOrder?.status === 'dispatched'
  ) {
    liveStep = 2
  } else {
    liveStep = 1
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-shell tracker-modal max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close Order Tracker">
          <X size={20} />
        </button>

        <div className="tracker-header mb-5">
          <span className="eyebrow text-amber-500 font-bold text-xs uppercase tracking-wider block mb-1">
            REALTIME DISPATCH TRACKER
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 tracking-tight">
            Track Your Order
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
            Realtime payment review and live courier progress across Addis Ababa. Choose any order below to view its live status.
          </p>
        </div>

        {/* ================= ALL PLACED ORDERS SELECTOR ================= */}
        {allOrders.length > 0 ? (
          <div className="mb-5 bg-neutral-100/90 border border-neutral-200 rounded-2xl p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Package size={15} className="text-amber-600" />
                Your Placed Orders ({allOrders.length}) · Click Any to Track
              </span>
              <span className="text-[11px] text-neutral-500 hidden sm:inline">
                Tap to switch order
              </span>
            </div>

            {/* Scrollable Orders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {allOrders.map((ord) => {
                const isSelected = activeOrder?.id.toLowerCase() === ord.id.toLowerCase()

                const isOrdDeclined =
                  ord.paymentStatus === 'rejected' ||
                  ord.paymentStatus === 'declined' ||
                  ord.status === 'declined'

                const isOrdApproved =
                  ord.paymentStatus === 'paid' ||
                  ord.paymentStatus === 'approved'

                const isOrdDelivered = ord.status === 'delivered'
                const isOrdOnWay =
                  ord.status === 'on_the_way' ||
                  ord.status === 'out_for_delivery' ||
                  ord.status === 'dispatched'

                let badge = {
                  label: 'Under Review',
                  bg: 'bg-amber-100 text-amber-900 border-amber-300'
                }
                if (isOrdDeclined) {
                  badge = { label: 'Declined', bg: 'bg-red-100 text-red-900 border-red-300' }
                } else if (isOrdDelivered) {
                  badge = { label: 'Delivered', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' }
                } else if (isOrdOnWay) {
                  badge = { label: 'On the Way', bg: 'bg-blue-100 text-blue-900 border-blue-300' }
                } else if (isOrdApproved) {
                  badge = { label: 'Approved', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' }
                }

                const firstItemName = ord.items?.[0]?.name || 'Ride Addis Order'
                const moreCount = (ord.items?.length || 0) - 1

                return (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => {
                      setSearchId(ord.id)
                      setActiveOrder(ord)
                      setSearchMessage('')
                    }}
                    className={`text-left p-3 rounded-xl border transition-all relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-md ring-2 ring-amber-400/60'
                        : 'bg-white hover:bg-neutral-50 text-neutral-900 border-neutral-200 hover:border-neutral-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5 w-full">
                      <span className={`font-mono font-bold text-xs ${isSelected ? 'text-amber-400' : 'text-neutral-900'}`}>
                        #{ord.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="w-full">
                      <p className={`text-xs font-semibold truncate ${isSelected ? 'text-neutral-200' : 'text-neutral-800'}`}>
                        {firstItemName} {moreCount > 0 ? `+${moreCount} more` : ''}
                      </p>
                      <div className="flex items-center justify-between text-[11px] mt-1.5 pt-1.5 border-t border-neutral-200/30">
                        <span className={`font-mono font-bold ${isSelected ? 'text-amber-300' : 'text-neutral-900'}`}>
                          ETB {ord.total?.toLocaleString()}
                        </span>
                        <span className={`text-[10px] ${isSelected ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          {ord.shippingAddress?.subcity || 'Addis Ababa'}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-2 pt-1 border-t border-neutral-800 flex items-center justify-between text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 size={12} /> Currently Tracking
                        </span>
                        <ArrowRight size={12} />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="mb-4 bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs text-neutral-600 flex items-center gap-2">
            <Package size={14} className="text-neutral-400 flex-shrink-0" />
            <span>No previous orders stored on this device. Enter your Order ID below to track.</span>
          </div>
        )}

        {/* Real Lookup Search Bar for custom ID or Phone */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
              {allOrders.length > 0 ? 'Or Search by Specific Order ID / Phone Number' : 'Enter Order Reference or Phone Number'}
            </label>
          </div>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Order ID (e.g. ORD-102938) or Phone"
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-neutral-900 transition"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm transition flex items-center gap-1.5 flex-shrink-0"
            >
              {isSearching ? 'Checking...' : 'Lookup'}
            </button>
          </form>
        </div>

        {searchMessage && !activeOrder && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl mb-6 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>{searchMessage}</span>
          </div>
        )}

        {activeOrder && (
          <div className="space-y-6">
            
            {/* Order Header Badge */}
            <div className="bg-neutral-100 rounded-2xl p-4 sm:p-5 border border-neutral-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <small className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                  ORDER REFERENCE
                </small>
                <h3 className="text-lg sm:text-xl font-bold font-mono text-neutral-900">
                  #{activeOrder.id}
                </h3>
                <span className="text-xs text-neutral-600">
                  Recipient: <strong className="text-neutral-900">{activeOrder.shippingAddress?.recipient}</strong> ({activeOrder.shippingAddress?.phone})
                </span>
              </div>

              <div className="text-left sm:text-right">
                <small className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                  TOTAL AMOUNT
                </small>
                <div className="text-base sm:text-lg font-bold font-mono text-neutral-900">
                  ETB {activeOrder.total?.toLocaleString()}
                </div>
                {activeOrder.transactionRef && (
                  <span className="text-[11px] font-mono text-neutral-600 block">
                    Ref: {activeOrder.transactionRef}
                  </span>
                )}
              </div>
            </div>

            {/* ================= FLOW STATE 1: PAYMENT DECLINED ================= */}
            {isDeclined && (
              <div className="bg-red-50 border-2 border-red-500/80 rounded-2xl p-5 text-red-950 space-y-3 shadow-md">
                <div className="flex items-center gap-2.5 text-red-700 font-bold text-base">
                  <XCircle className="w-6 h-6 flex-shrink-0 text-red-600" />
                  <span>Payment Declined by Administrator</span>
                </div>
                
                <div className="bg-white/80 border border-red-200 rounded-xl p-3.5">
                  <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider block mb-1">
                    REASON FOR DECLINE:
                  </span>
                  <p className="text-sm font-semibold text-neutral-900">
                    "{activeOrder.declineReason || 'Transaction reference code could not be verified in official bank/telebirr statement.'}"
                  </p>
                </div>

                <p className="text-xs text-red-800 leading-relaxed">
                  This order has been closed. If you transferred funds or have a corrected reference number, please contact Ride Addis customer support at <strong className="underline">+251 91 123 4567</strong> or place a new order.
                </p>
              </div>
            )}

            {/* ================= FLOW STATE 2: PAYMENT PENDING REVIEW ================= */}
            {isPendingReview && (
              <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-5 text-amber-950 space-y-2.5 shadow-sm">
                <div className="flex items-center gap-2.5 text-amber-800 font-bold text-base">
                  <Clock className="w-5 h-5 flex-shrink-0 text-amber-600 animate-pulse" />
                  <span>Payment Under Verification</span>
                </div>
                <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                  Your payment reference (<strong className="font-mono">{activeOrder.transactionRef || 'Pending submission'}</strong>) has been received. Our Addis Ababa administrative team is actively cross-checking with the bank. Once verified, dispatch will begin immediately.
                </p>
                <div className="text-[11px] text-amber-800 font-semibold pt-1">
                  Destination: {activeOrder.shippingAddress?.street}, {activeOrder.shippingAddress?.subcity}
                </div>
              </div>
            )}

            {/* ================= FLOW STATE 3: PAYMENT APPROVED -> ON THE WAY -> DELIVERED ================= */}
            {isApproved && (
              <div className="space-y-5">
                {/* Verification Notice */}
                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center gap-3 text-emerald-900">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <div className="text-xs sm:text-sm">
                    <strong>Payment Approved & Verified by Admin</strong>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Transaction verified. Order is cleared for Addis Ababa doorstep delivery.
                    </p>
                  </div>
                </div>

                {/* Simple 3-Step Flow: Approved -> On the Way -> Delivered */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold block mb-4">
                    DELIVERY PROGRESSION
                  </span>

                  <div className="grid grid-cols-3 gap-2 text-center relative">
                    {/* Connecting line */}
                    <div className="absolute top-4 left-[16%] right-[16%] h-1 bg-neutral-200 -z-0">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{
                          width: liveStep === 1 ? '0%' : liveStep === 2 ? '50%' : '100%'
                        }}
                      />
                    </div>

                    {/* Stage 1 */}
                    <div className="flex flex-col items-center relative z-10">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shadow-md">
                        <CheckCircle2 size={16} />
                      </div>
                      <strong className="text-xs mt-2 text-neutral-900">Approved</strong>
                      <span className="text-[10px] text-neutral-500">Payment verified</span>
                    </div>

                    {/* Stage 2 */}
                    <div className="flex flex-col items-center relative z-10">
                      <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs shadow-md transition ${
                        liveStep >= 2 ? 'bg-emerald-500 text-white' : 'bg-neutral-200 text-neutral-500'
                      }`}>
                        {liveStep >= 2 ? <Truck size={16} /> : <span>2</span>}
                      </div>
                      <strong className={`text-xs mt-2 ${liveStep >= 2 ? 'text-neutral-900 font-bold' : 'text-neutral-400'}`}>
                        On the Way
                      </strong>
                      <span className="text-[10px] text-neutral-500">In transit</span>
                    </div>

                    {/* Stage 3 */}
                    <div className="flex flex-col items-center relative z-10">
                      <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs shadow-md transition ${
                        liveStep >= 3 ? 'bg-emerald-500 text-white' : 'bg-neutral-200 text-neutral-500'
                      }`}>
                        {liveStep >= 3 ? <CheckCircle2 size={16} /> : <span>3</span>}
                      </div>
                      <strong className={`text-xs mt-2 ${liveStep >= 3 ? 'text-neutral-900 font-bold' : 'text-neutral-400'}`}>
                        Delivered
                      </strong>
                      <span className="text-[10px] text-neutral-500">Handed over</span>
                    </div>
                  </div>
                </div>

                {/* Courier Contact Card (When on the way or approved) */}
                {activeOrder.courierName && (
                  <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center flex-shrink-0">
                        <Truck size={18} />
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                          ASSIGNED DISPATCH COURIER
                        </span>
                        <strong className="text-sm text-neutral-900">{activeOrder.courierName}</strong>
                        <div className="text-xs text-neutral-600">{activeOrder.eta}</div>
                      </div>
                    </div>

                    {activeOrder.courierPhone && (
                      <a
                        href={`tel:${activeOrder.courierPhone}`}
                        style={{ color: '#ffffff', backgroundColor: '#171717' }}
                        className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl transition shadow hover:opacity-90 flex-shrink-0"
                      >
                        <Phone size={14} className="text-amber-400 flex-shrink-0" />
                        <span style={{ color: '#ffffff', fontWeight: 700 }}>
                          Call Courier ({activeOrder.courierPhone})
                        </span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Destination Address */}
            <div className="text-xs text-neutral-600 flex items-center gap-1.5 pt-1">
              <MapPin size={14} className="text-neutral-400" />
              <span>
                Delivery Address: <strong>{activeOrder.shippingAddress?.street}, {activeOrder.shippingAddress?.subcity}</strong>
              </span>
            </div>

            {/* Items in this Order */}
            <div className="border-t border-neutral-200 pt-4">
              <span className="text-xs font-bold text-neutral-700 block mb-3">
                Items in Order ({activeOrder.items?.length || 0})
              </span>
              <div className="space-y-2">
                {activeOrder.items?.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-neutral-50 p-2.5 rounded-xl border border-neutral-200">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={it.image || '/hero-bike.png'}
                        alt={it.name}
                        className="w-9 h-9 object-contain bg-white rounded-lg p-1 border border-neutral-200"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = '/hero-bike.png'
                        }}
                      />
                      <div>
                        <strong className="text-neutral-900 block">{it.name}</strong>
                        <span className="text-neutral-500">Qty: {it.quantity}</span>
                      </div>
                    </div>
                    <strong className="font-mono text-neutral-900">
                      ETB {(it.price * it.quantity).toLocaleString()}
                    </strong>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
