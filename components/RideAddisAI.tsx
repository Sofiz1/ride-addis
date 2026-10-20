'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, Send, Sparkles, Bot, ArrowRight } from 'lucide-react'
import { Product, PRODUCTS } from '@/lib/catalog'
import { Order, loadCustomProducts } from '@/lib/store'

interface Message {
  id: string
  sender: 'ai' | 'user'
  text: string
  suggestedProduct?: Product
  action?: {
    type: 'view_product' | 'track_order' | 'open_finder'
    label: string
    payload?: any
  }
}

interface RideAddisAIProps {
  onSelectProduct: (product: Product) => void
  onOpenTrackOrder: () => void
  onOpenFinder: () => void
  orders: Order[]
  isLoggedIn: boolean
  products?: Product[]
}

function stripEmojis(str: string): string {
  return str.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F1E6}-\u{1F1FF}]/gu, '').trim()
}

export function RideAddisAI({
  onSelectProduct,
  onOpenTrackOrder,
  onOpenFinder,
  orders,
  isLoggedIn,
  products
}: RideAddisAIProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: "Selam! I am Ride Addis AI, your local cycling advisor in Addis Ababa. How can I help you today? Ask me about bikes, Entoto trails, prices in ETB, delivery, or your order."
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [viewportStyle, setViewportStyle] = useState<{ height?: string; bottom?: string }>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)

  // Use passed products or fallback to store's custom products
  const activeProducts = (products && products.length > 0) ? products : loadCustomProducts()

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  // Mobile visualViewport tracking for on-screen virtual keyboard resizing
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleViewportChange = () => {
      if (!window.visualViewport) return
      // Only apply dynamic sizing on mobile viewports (< 768px)
      if (window.innerWidth < 768) {
        const vv = window.visualViewport
        // Calculate offset if keyboard pushes viewport
        const offsetTop = vv.offsetTop || 0
        const height = vv.height
        setViewportStyle({
          height: `${height}px`,
          bottom: `${Math.max(0, window.innerHeight - (offsetTop + height))}px`
        })
        scrollToBottom('auto')
      } else {
        setViewportStyle({})
      }
    }

    if (isOpen) {
      handleViewportChange()
      window.visualViewport?.addEventListener('resize', handleViewportChange)
      window.visualViewport?.addEventListener('scroll', handleViewportChange)

      // Lock mobile body scroll while chat is open
      const prevBodyOverflow = document.body.style.overflow
      if (window.innerWidth < 768) {
        document.body.style.overflow = 'hidden'
      }

      return () => {
        window.visualViewport?.removeEventListener('resize', handleViewportChange)
        window.visualViewport?.removeEventListener('scroll', handleViewportChange)
        document.body.style.overflow = prevBodyOverflow
      }
    } else {
      setViewportStyle({})
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input
    if (!query.trim()) return

    const userMsg: Message = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: stripEmojis(query)
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInput('')
    setIsTyping(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-4),
          products: activeProducts
        })
      })

      const data = await res.json()
      let replyText = data.reply ? stripEmojis(data.reply) : ''

      if (!replyText) {
        replyText = "Ride Addis provides bicycles tailored for Addis Ababa terrain. Ask about bicycle models, delivery, or Telebirr and CBE payments."
      }

      // Dynamic product matching across all live products (including newly added items via CRUD)
      let matchedProduct: Product | undefined = undefined
      let action: Message['action'] = undefined

      const q = query.toLowerCase()

      // 1. Check for exact or partial name matches in current catalog
      const matched = activeProducts.find((p) => {
        const pName = p.name.toLowerCase()
        const pBrand = p.brand.toLowerCase()
        return q.includes(pName) || pName.split(' ').some((word) => word.length > 3 && q.includes(word)) || q.includes(pBrand)
      })

      if (matched) {
        matchedProduct = matched
        action = {
          type: 'view_product',
          label: `View ${matched.name}`,
          payload: matched
        }
      } else if ((q.includes('entoto') || q.includes('mountain') || q.includes('trail')) && !q.includes('general')) {
        matchedProduct = activeProducts.find((p) => p.category.toLowerCase().includes('mountain')) || activeProducts[1] || PRODUCTS[1]
        action = {
          type: 'view_product',
          label: `View ${matchedProduct?.name || 'Entoto Trail S'}`,
          payload: matchedProduct
        }
      } else if (q.includes('cheap') || q.includes('lowest') || q.includes('affordable') || q.includes('budget')) {
        const sorted = [...activeProducts].sort((a, b) => a.price - b.price)
        matchedProduct = sorted[0] || activeProducts[0]
        action = {
          type: 'view_product',
          label: `View ${matchedProduct.name} (${matchedProduct.priceFormatted})`,
          payload: matchedProduct
        }
      } else if (q.includes('track') || q.includes('order')) {
        if (isLoggedIn && orders.length > 0) {
          action = {
            type: 'track_order',
            label: 'Open Live Order Tracker'
          }
        }
      } else if (q.includes('find') || q.includes('quiz') || q.includes('size')) {
        action = {
          type: 'open_finder',
          label: 'Run Sizing Quiz'
        }
      }

      const aiReply: Message = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: replyText,
        suggestedProduct: matchedProduct,
        action
      }

      setMessages((prev) => [...prev, aiReply])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: 'ai-' + Date.now(),
          sender: 'ai',
          text: "Ride Addis provides bicycles for all Addis Ababa elevations. You can explore our collection or ask about Telebirr payments."
        }
      ])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <>
      {/* Floating AI Button - ONLY the circular icon, NO badge text */}
      <button
        className={`ride-addis-ai-toggle icon-only ${isOpen ? 'is-active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Ride Addis AI Chat"
        title="Ride Addis AI"
      >
        <div className="ai-btn-inner">
          <Bot size={22} />
          <span className="ai-glow-pulse" />
        </div>
      </button>

      {/* Floating Chat Modal */}
      {isOpen && (
        <>
          {/* Mobile Background Dim Backdrop */}
          <div
            className="ai-chat-mobile-backdrop"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            className="ride-addis-ai-window"
            role="dialog"
            aria-label="Ride Addis AI Advisor"
            style={viewportStyle}
          >
            {/* Header */}
            <div className="ai-chat-header">
              <div className="ai-profile">
                <div className="ai-avatar-icon">
                  <Bot size={18} />
                </div>
                <div>
                  <strong>Ride Addis AI</strong>
                  <p><span className="online-dot" /> Cycling & Altitude Specialist</p>
                </div>
              </div>
              <button className="ai-close-btn" onClick={() => setIsOpen(false)} aria-label="Close chat">
                <X size={18} />
              </button>
            </div>

            {/* Quick Questions Chips - ZERO EMOJIS, NO BOLE */}
            <div className="ai-chips-scroll">
              <button onClick={() => handleSend('What are your bicycle prices in ETB?')}>
                Prices in ETB
              </button>
              <button onClick={() => handleSend('Best bike for Entoto trails?')}>
                Entoto Trail
              </button>
              <button onClick={() => handleSend('Best bike for city commute?')}>
                City Commute
              </button>
              <button onClick={() => handleSend('How to pay with Telebirr or CBE Birr?')}>
                Telebirr / CBE
              </button>
              <button onClick={() => handleSend('How do I track my order?')}>
                Track Order
              </button>
            </div>

            {/* Messages Area */}
            <div className="ai-messages-container">
              {messages.map((m) => (
                <div key={m.id} className={`ai-msg-row ${m.sender === 'user' ? 'is-user' : 'is-ai'}`}>
                  {m.sender === 'ai' && (
                    <div className="ai-tiny-avatar">
                      <Sparkles size={12} />
                    </div>
                  )}
                  <div className="ai-bubble">
                    <p>{m.text}</p>

                    {/* Product Text Suggestion (Strictly NO Images) */}
                    {m.suggestedProduct && (
                      <div className="ai-product-suggestion text-only">
                        <div className="product-match-text">
                          <strong>{m.suggestedProduct.name}</strong>
                          <span>{m.suggestedProduct.priceFormatted || 'ETB ' + m.suggestedProduct.price} · {m.suggestedProduct.category}</span>
                        </div>
                      </div>
                    )}

                    {/* Action Link */}
                    {m.action && (
                      <button
                        className="ai-action-btn"
                        onClick={() => {
                          if (m.action?.type === 'view_product') {
                            onSelectProduct(m.action.payload)
                            setIsOpen(false)
                          } else if (m.action?.type === 'track_order') {
                            onOpenTrackOrder()
                            setIsOpen(false)
                          } else if (m.action?.type === 'open_finder') {
                            onOpenFinder()
                            setIsOpen(false)
                          }
                        }}
                      >
                        {m.action.label} <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="ai-msg-row is-ai">
                  <div className="ai-tiny-avatar"><Sparkles size={12} /></div>
                  <div className="ai-bubble typing-bubble">
                    <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="ai-chat-input-bar"
            >
              <input
                ref={chatInputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => {
                  setTimeout(() => scrollToBottom('smooth'), 220)
                }}
                placeholder="Ask about bikes, trails, or orders..."
              />
              <button type="submit" disabled={!input.trim()} className="ai-send-btn" aria-label="Send message">
                <Send size={15} />
              </button>
            </form>
          </div>
        </>
      )}
    </>
  )
}
