'use client'

import React, { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

import { CloudDivider } from './CloudDivider'

interface FaqItem {
  question: string
  answer: string
}

const FAQS: FaqItem[] = [
  {
    question: 'How does bicycle delivery work across Addis Ababa?',
    answer: 'All orders over ETB 50,000 qualify for free express delivery anywhere in Addis Ababa. Your bicycle is transported securely and arrives 100% fully assembled, pre-calibrated, and ready to ride.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept Telebirr (0966245048), CBEBirr (0966245048), and Commercial Bank of Ethiopia CBE account (1000359050047) under Fraol Woldekidan, as well as Cash on Delivery. Simply submit your transaction reference number during checkout for instant team verification.'
  },
  {
    question: 'How do I choose the correct frame and wheel size?',
    answer: 'You can use our built-in Find My Bike sizing studio located in the main menu. Select your rider age category or preferred riding style (City, Entoto Trails, or Speed Road) to instantly calculate recommended standover height and wheel geometry.'
  },
  {
    question: 'Are bicycles delivered assembled and safety-inspected?',
    answer: 'Yes, 100%. Every bicycle undergoes a rigorous multi-point inspection by certified Addis Ababa mechanics: gear indexing, hydraulic disc brake bleeding, headset torqueing, and tubeless/tube pressure checks.'
  },
  {
    question: 'Can I inspect the bicycle upon handover?',
    answer: 'Yes. Upon arrival at your Addis Ababa address, our dispatch courier will present the bicycle for your personal inspection and initial fit check before signing.'
  },
  {
    question: 'Where is Ride Addis located?',
    answer: 'Our operations are located in Addis Ababa, Ethiopia. We serve cyclists throughout the capital with on-demand doorstep delivery, certified bike fitting, and technical cycling support.'
  }
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section id="faq" className="faq-section">
      <div className="section-heading faq-heading">
        <div>
          <p className="eyebrow">COMMON QUESTIONS</p>
          <h2>Frequently Asked Questions</h2>
          <p className="section-lede">
            Everything you need to know about purchasing, paying with Telebirr/CBE, and receiving your bicycle in Addis Ababa.
          </p>
        </div>
      </div>

      <div className="faq-accordion-grid">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx
          return (
            <div key={idx} className={`faq-card ${isOpen ? 'is-open' : ''}`}>
              <button
                className="faq-question-btn"
                onClick={() => toggleFaq(idx)}
                aria-expanded={isOpen}
              >
                <span className="faq-q-text">{faq.question}</span>
                <ChevronDown size={18} className="faq-chevron" />
              </button>
              {isOpen && (
                <div className="faq-answer-pane">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <CloudDivider fill="#151916" position="bottom" />
    </section>
  )
}
