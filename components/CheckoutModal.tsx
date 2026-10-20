'use client'

import React, { useState, useEffect } from 'react'
import { X, CheckCircle2, ShieldCheck, QrCode, CreditCard, Banknote, ArrowRight, Package, MapPin, Copy, Check, User, Phone as PhoneIcon, Navigation } from 'lucide-react'
import { CartItem, UserProfile, Address, Order, AdminSettings, loadAdminSettings } from '@/lib/store'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  user: UserProfile | null
  onOrderPlaced: (newOrder: Order) => void
  onOpenTrackOrder: (orderId: string) => void
}

export function CheckoutModal({
  isOpen,
  onClose,
  items,
  user,
  onOrderPlaced,
  onOpenTrackOrder
}: CheckoutModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [placedOrderId, setPlacedOrderId] = useState('')

  // Live admin-configured payment details (reloaded on open)
  const [settings, setSettings] = useState<AdminSettings>(loadAdminSettings())

  useEffect(() => {
    if (isOpen) {
      setSettings(loadAdminSettings())
      setStep('form')
      setTransactionRef('')
      setPlacedOrderId('')
      setIsSubmitting(false)
    }
  }, [isOpen])

  const handleModalClose = () => {
    setStep('form')
    setTransactionRef('')
    setPlacedOrderId('')
    setIsSubmitting(false)
    onClose()
  }

  // Address fields
  const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0]
  const [selectedAddrId, setSelectedAddrId] = useState<string>(defaultAddress?.id || 'new')
  const [recipient, setRecipient] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [subcity, setSubcity] = useState(user?.subcity || 'Bole, Addis Ababa')
  const [street, setStreet] = useState(defaultAddress?.street || '')
  const [landmark, setLandmark] = useState(defaultAddress?.landmark || '')

  // Sync recipient with user when user logs in or modal opens
  useEffect(() => {
    if (user) {
      if (!recipient) setRecipient(user.name)
      if (!phone) setPhone(user.phone)
      if (user.subcity && (!subcity || subcity === 'Addis Ababa')) setSubcity(user.subcity)
      if (defaultAddress) {
        setSelectedAddrId(defaultAddress.id)
        setStreet(defaultAddress.street)
        setLandmark(defaultAddress.landmark || '')
      }
    }
  }, [user, isOpen])

  // Payment choice
  const [paymentMethod, setPaymentMethod] = useState<'telebirr' | 'cbe_birr' | 'cash_on_delivery' | 'bank_transfer'>('telebirr')
  const [transactionRef, setTransactionRef] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const subtotal = items.reduce((acc, it) => acc + it.product.price * it.quantity, 0)
  const deliveryFee = subtotal >= 50000 ? 0 : 1200
  const total = subtotal + deliveryFee

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault()

    if ((paymentMethod === 'telebirr' || paymentMethod === 'cbe_birr' || paymentMethod === 'bank_transfer') && !transactionRef.trim()) {
      alert('Please enter your transaction reference number after sending payment so our team can verify and dispatch your order.')
      return
    }

    setIsSubmitting(true)

    setTimeout(() => {
      const orderNumber = 'RA-' + Math.floor(10000 + Math.random() * 90000)
      const shippingAddress: Address = {
        id: 'addr_' + Date.now(),
        label: 'Delivery Location',
        recipient: recipient || 'Customer',
        phone: phone || '+251 91 000 0000',
        subcity: subcity,
        street: street,
        landmark: landmark,
        isDefault: true
      }

      const newOrder: Order = {
        id: orderNumber,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        items: items.map((it) => ({
          productId: it.product.id,
          name: it.product.name + (it.selectedSize ? ` (${it.selectedSize.split(' ')[0]})` : ''),
          price: it.product.price,
          quantity: it.quantity,
          image: it.product.images[0]
        })),
        total: total,
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending_approval',
        transactionRef: transactionRef.trim(),
        status: 'confirmed',
        statusStep: 1,
        eta: 'Estimated 1-2 days delivery in Addis Ababa',
        courierName: 'Addis Ababa Express Dispatch',
        courierPhone: '+251 92 111 2233'
      }

      // Persist to server JSON database for YegaraHost & Admin
      try {
        fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder)
        }).catch(console.error)
      } catch (e) {
        console.error(e)
      }

      onOrderPlaced(newOrder)
      setPlacedOrderId(orderNumber)
      setStep('success')
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <div className="modal-backdrop" onClick={handleModalClose}>
      <div className="modal-shell checkout-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={handleModalClose} aria-label="Close checkout">
          <X size={20} />
        </button>

        {step === 'form' ? (
          <div className="checkout-content">
            <div className="checkout-header">
              <span className="eyebrow">SECURE CHECKOUT & DISPATCH</span>
              <h2>Complete Your Ride Addis Order</h2>
              <p>Calibrated bicycle delivery across Addis Ababa. Tuned and ready to ride.</p>
            </div>

            <form onSubmit={handlePlaceOrder} className="checkout-form-grid">
              {/* LEFT: Address & Payment */}
              <div className="checkout-left-col">
                {/* 1. Recipient Information & Delivery Location */}
                <div className="checkout-section-box">
                  <div className="checkout-section-header">
                    <span className="section-step-badge">STEP 01</span>
                    <div>
                      <h3>Recipient Information & Delivery Location</h3>
                      <p>Where our express vehicle will deliver your fully assembled bicycle in Addis Ababa.</p>
                    </div>
                  </div>

                  {user?.addresses && user.addresses.length > 0 && (
                    <div className="saved-addr-picker">
                      <span className="saved-addr-label">Choose from your saved addresses:</span>
                      <div className="saved-addr-list">
                        {user.addresses.map((addr) => (
                          <label
                            key={addr.id}
                            className={`addr-radio-card ${selectedAddrId === addr.id ? 'is-selected' : ''}`}
                          >
                            <input
                              type="radio"
                              name="addressSelect"
                              checked={selectedAddrId === addr.id}
                              onChange={() => {
                                setSelectedAddrId(addr.id)
                                setRecipient(addr.recipient)
                                setPhone(addr.phone)
                                setSubcity(addr.subcity)
                                setStreet(addr.street)
                                setLandmark(addr.landmark || '')
                              }}
                            />
                            <div className="addr-card-info">
                              <div className="addr-card-title">
                                <strong>{addr.label}</strong>
                                {addr.isDefault && <span className="default-tag">Default</span>}
                              </div>
                              <p className="addr-card-text">{addr.street}, {addr.subcity}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bespoke Styled Form Fields */}
                  <div className="checkout-fields-grid">
                    <div className="checkout-field-wrapper">
                      <label className="checkout-field-label">
                        <User size={13} className="label-icon" />
                        <span>Recipient Full Name</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="checkout-text-input"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="e.g. Alazar Tadesse"
                      />
                    </div>

                    <div className="checkout-field-wrapper">
                      <label className="checkout-field-label">
                        <PhoneIcon size={13} className="label-icon" />
                        <span>Phone Number (Courier Contact)</span>
                      </label>
                      <input
                        type="tel"
                        required
                        className="checkout-text-input"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+251 91 123 4567"
                      />
                    </div>

                    <div className="checkout-field-wrapper">
                      <label className="checkout-field-label">
                        <Navigation size={13} className="label-icon" />
                        <span>Addis Ababa Sub-City</span>
                      </label>
                      <select
                        className="checkout-select-input"
                        value={subcity}
                        onChange={(e) => setSubcity(e.target.value)}
                      >
                        <option value="Addis Ababa Central">Addis Ababa Central</option>
                        <option value="Kazanchis">Kazanchis</option>
                        <option value="Kirkos">Kirkos</option>
                        <option value="Yeka / CMC">Yeka / CMC</option>
                        <option value="Lideta">Lideta</option>
                        <option value="Nifas Silk">Nifas Silk</option>
                        <option value="Arada">Arada</option>
                      </select>
                    </div>

                    <div className="checkout-field-wrapper">
                      <label className="checkout-field-label">
                        <MapPin size={13} className="label-icon" />
                        <span>Street & Notable Landmark</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="checkout-text-input"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="e.g. Cameroon St, Near Edna Mall"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Select Payment Method */}
                <div className="checkout-section-box">
                  <div className="checkout-section-header">
                    <span className="section-step-badge">STEP 02</span>
                    <div>
                      <h3>Select Payment Method</h3>
                      <p>Verified Ethiopian payment channels. All payments confirmed by admin before dispatch.</p>
                    </div>
                  </div>
                  <div className="payment-options-grid">
                    {/* Telebirr */}
                    <label className={`payment-pill ${paymentMethod === 'telebirr' ? 'is-selected' : ''}`}>
                      <input
                        type="radio"
                        name="payMethod"
                        checked={paymentMethod === 'telebirr'}
                        onChange={() => setPaymentMethod('telebirr')}
                      />
                      <img src="/telebirr-logo.svg" alt="Telebirr" className="checkout-pay-icon telebirr-icon" />
                      <div>
                        <strong>Telebirr (ቴሌብር)</strong>
                        <small>Direct Phone Transfer</small>
                      </div>
                    </label>

                    {/* CBE Birr */}
                    <label className={`payment-pill ${paymentMethod === 'cbe_birr' ? 'is-selected' : ''}`}>
                      <input
                        type="radio"
                        name="payMethod"
                        checked={paymentMethod === 'cbe_birr'}
                        onChange={() => setPaymentMethod('cbe_birr')}
                      />
                      <img src="/cbe-birr-logo.svg" alt="CBE Birr" className="checkout-pay-icon cbe-icon" />
                      <div>
                        <strong>CBEBirr (ሲቢኢ ብር)</strong>
                        <small>Direct Phone Transfer</small>
                      </div>
                    </label>

                    {/* CBE Bank Account */}
                    <label className={`payment-pill ${paymentMethod === 'bank_transfer' ? 'is-selected' : ''}`}>
                      <input
                        type="radio"
                        name="payMethod"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={() => setPaymentMethod('bank_transfer')}
                      />
                      <img src="/cbe-logo.png" alt="Commercial Bank of Ethiopia" className="checkout-pay-icon cbe-gold-icon" />
                      <div>
                        <strong>CBE Account (ንግድ ባንክ)</strong>
                        <small>Direct Bank Account</small>
                      </div>
                    </label>

                    {/* Cash on Delivery */}
                    <label className={`payment-pill ${paymentMethod === 'cash_on_delivery' ? 'is-selected' : ''}`}>
                      <input
                        type="radio"
                        name="payMethod"
                        checked={paymentMethod === 'cash_on_delivery'}
                        onChange={() => setPaymentMethod('cash_on_delivery')}
                      />
                      <Banknote size={18} />
                      <div>
                        <strong>Cash on Delivery</strong>
                        <small>Pay at Doorstep after bicycle inspection</small>
                      </div>
                    </label>
                  </div>

                  {/* Telebirr Instructions & Transaction Ref Prompt */}
                  {paymentMethod === 'telebirr' && (
                    <div className="payment-instruction-box">
                      <div className="pay-detail-row">
                        <div>
                          <small>TELEBIRR PHONE NUMBER</small>
                          <strong>{settings.telebirrPhone || '0966245048'}</strong>
                          <p>{settings.telebirrMerchantName || 'Fraol Woldekidan'}</p>
                        </div>
                        <button
                          type="button"
                          className="copy-btn"
                          onClick={() => copyToClipboard(settings.telebirrPhone || '0966245048')}
                        >
                          {copiedCode ? <Check size={14} /> : <Copy size={14} />} {copiedCode ? 'Copied' : 'Copy'}
                        </button>
                      </div>

                      <label className="ref-input-label">
                        Enter Telebirr Transaction / Reference Number:
                        <input
                          type="text"
                          required
                          value={transactionRef}
                          onChange={(e) => setTransactionRef(e.target.value)}
                          placeholder="e.g. TB84920184 or reference ID from SMS"
                          className="ref-text-input"
                        />
                        <small className="field-hint">
                          Transfer ETB {total.toLocaleString()} to phone 0966245048 (Fraol Woldekidan) in your Telebirr app, then paste the reference number here so our team can verify and dispatch.
                        </small>
                      </label>
                    </div>
                  )}

                  {/* CBEBirr Instructions & Transaction Ref Prompt */}
                  {paymentMethod === 'cbe_birr' && (
                    <div className="payment-instruction-box">
                      <div className="pay-detail-row">
                        <div>
                          <small>CBEBIRR PHONE NUMBER</small>
                          <strong>{settings.cbebirrPhone || '0966245048'}</strong>
                          <p>{settings.cbebirrName || 'Fraol Woldekidan'}</p>
                        </div>
                        <button
                          type="button"
                          className="copy-btn"
                          onClick={() => copyToClipboard(settings.cbebirrPhone || '0966245048')}
                        >
                          {copiedCode ? <Check size={14} /> : <Copy size={14} />} {copiedCode ? 'Copied' : 'Copy'}
                        </button>
                      </div>

                      <label className="ref-input-label">
                        Enter CBEBirr Transaction Reference Number:
                        <input
                          type="text"
                          required
                          value={transactionRef}
                          onChange={(e) => setTransactionRef(e.target.value)}
                          placeholder="e.g. CB2610XXXX or reference ID from SMS"
                          className="ref-text-input"
                        />
                        <small className="field-hint">
                          Transfer ETB {total.toLocaleString()} to CBEBirr phone 0966245048 (Fraol Woldekidan), then paste the confirmation code from your SMS.
                        </small>
                      </label>
                    </div>
                  )}

                  {/* CBE Bank Account Instructions & Transaction Ref Prompt */}
                  {paymentMethod === 'bank_transfer' && (
                    <div className="payment-instruction-box">
                      <div className="pay-detail-row">
                        <div>
                          <small>CBE BANK ACCOUNT NUMBER</small>
                          <strong>{settings.cbeAccountNumber || '1000359050047'}</strong>
                          <p>{settings.cbeAccountName || 'Fraol Woldekidan'} · {settings.cbeBankBranch || 'Commercial Bank of Ethiopia (CBE)'}</p>
                        </div>
                        <button
                          type="button"
                          className="copy-btn"
                          onClick={() => copyToClipboard(settings.cbeAccountNumber || '1000359050047')}
                        >
                          {copiedCode ? <Check size={14} /> : <Copy size={14} />} {copiedCode ? 'Copied' : 'Copy'}
                        </button>
                      </div>

                      <label className="ref-input-label">
                        Enter CBE Bank Transaction Reference Number:
                        <input
                          type="text"
                          required
                          value={transactionRef}
                          onChange={(e) => setTransactionRef(e.target.value)}
                          placeholder="e.g. FT261015XXXX"
                          className="ref-text-input"
                        />
                        <small className="field-hint">
                          Transfer ETB {total.toLocaleString()} to Commercial Bank of Ethiopia (CBE) account 1000359050047 (Fraol Woldekidan), then paste the FT reference code from your CBE Mobile confirmation SMS.
                        </small>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT: Order Summary */}
              <div className="checkout-right-col">
                <div className="order-summary-box">
                  <h3>Order Summary</h3>
                  <div className="summary-items-list">
                    {items.map((it) => (
                      <div key={it.product.id} className="summary-item-row">
                        <span>{it.quantity}x {it.product.name}</span>
                        <strong>ETB {(it.product.price * it.quantity).toLocaleString()}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="summary-total-lines">
                    <div>
                      <span>Subtotal</span>
                      <span>ETB {subtotal.toLocaleString()}</span>
                    </div>
                    <div>
                      <span>Addis Delivery</span>
                      <span>{deliveryFee === 0 ? 'FREE' : 'ETB 1,200'}</span>
                    </div>
                    <div className="grand-total-row">
                      <span>Grand Total</span>
                      <strong>ETB {total.toLocaleString()}</strong>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="button button-dark full-width place-order-btn"
                  >
                    {isSubmitting ? 'Submitting Order...' : `Submit Order (ETB ${total.toLocaleString()})`}
                    {!isSubmitting && <ArrowRight size={16} />}
                  </button>

                  <div className="secure-badge-note">
                    <ShieldCheck size={16} />
                    <span>Inspected & calibrated for Addis Ababa altitude</span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        ) : (
          // ================= SUCCESS CONFIRMATION STATE =================
          <div className="checkout-success-view">
            <div className="success-icon-check">
              <CheckCircle2 size={54} color="#526c58" />
            </div>
            <span className="eyebrow">ORDER SUBMITTED</span>
            <h2>Thank You for Your Order!</h2>
            <p className="order-id-display">
              Order Reference: <strong>#{placedOrderId}</strong>
            </p>
            {transactionRef && (
              <p className="payment-ref-badge">
                Payment Reference: <strong>{transactionRef}</strong> (Pending Verification)
              </p>
            )}
            <p className="success-desc">
              Our workshop team will inspect your payment reference and begin preparation for dispatch to {subcity}.
            </p>

            <div className="success-actions">
              <button
                className="button button-dark"
                onClick={() => {
                  handleModalClose()
                  onOpenTrackOrder(placedOrderId)
                }}
              >
                <Package size={16} /> Track Live Delivery Progress
              </button>
              <button className="button button-outline" onClick={handleModalClose}>
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
