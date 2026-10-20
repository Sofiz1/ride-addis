'use client'

import React from 'react'
import { X, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react'

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-shell terms-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close Terms of Service">
          <X size={20} />
        </button>

        <div className="terms-header">
          <div className="terms-badge">
            <FileText size={16} />
            <span>OFFICIAL STORE POLICY</span>
          </div>
          <h2>Terms of Service & Privacy Policy</h2>
          <p className="terms-subtitle">
            Ride Addis · High-Altitude Cycling & Urban Mobility · Addis Ababa, Ethiopia
          </p>
        </div>

        <div className="terms-body">
          <section className="terms-section">
            <h3>1. Addis Ababa Delivery & Assembly Guarantee</h3>
            <p>
              Every bicycle purchased through Ride Addis is tuned, calibrated, and safety-inspected by certified mechanics in Addis Ababa before dispatch. Free delivery applies to orders with cart subtotal exceeding ETB 50,000. All bicycles arrive fully assembled, calibrated for high-altitude riding, and ready to ride.
            </p>
          </section>

          <section className="terms-section">
            <h3>2. Payment Verification & Birr Settlements</h3>
            <p>
              We accept official transfers via Telebirr and Commercial Bank of Ethiopia (CBE Birr). When placing an order, customers submit their transaction reference number. Payments are verified against bank confirmation records before dispatch. No hidden fees or foreign currency exchange charges apply.
            </p>
          </section>

          <section className="terms-section">
            <h3>3. 12-Month Workshop Service & Warranty</h3>
            <p>
              All complete bicycles include a 12-month workshop service warranty covering frame welds, gear index adjustment, and hydraulic brake bleeding. Normal wear and tear on tires and inner tubes resulting from standard road friction is excluded.
            </p>
          </section>

          <section className="terms-section">
            <h3>4. Account Privacy & Data Protection</h3>
            <p>
              Your contact details, phone number, and delivery address are strictly utilized to coordinate order dispatch and customer support across Addis Ababa sub-cities. We never sell, lease, or distribute customer details to third-party advertising brokers.
            </p>
          </section>

          <section className="terms-section">
            <h3>5. Returns & Exchange Policy</h3>
            <p>
              If a bicycle frame sizing does not match your biometric fit upon delivery, our dispatch rider will coordinate an exchange within 48 hours, subject to frame condition and stock availability in our Addis Ababa inventory.
            </p>
          </section>
        </div>

        <div className="terms-footer">
          <div className="terms-guarantee">
            <ShieldCheck size={18} />
            <span>Verified high-altitude standard for Addis Ababa riders</span>
          </div>
          <button className="button button-dark" onClick={onClose}>
            <CheckCircle2 size={16} /> I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  )
}
