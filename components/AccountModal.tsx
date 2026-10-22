'use client'

import React, { useState, useMemo } from 'react'
import {
  X,
  UserRound,
  MapPin,
  Package,
  Heart,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  Check,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Phone,
  User,
  LogIn,
  UserPlus,
  ChevronDown,
  Loader2
} from 'lucide-react'
import { UserProfile, Address, Order, validatePasswordStrength, isValidEthiopianPhone } from '@/lib/store'

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
  user: UserProfile | null
  onUpdateUser: (user: UserProfile | null) => void
  orders: Order[]
  onTrackOrder: (orderId: string) => void
  onOpenWishlist: () => void
  wishlistCount: number
  onOpenTerms?: () => void
  isAm?: boolean
}

const ADDIS_SUBCITIES = [
  { value: 'Bole, Addis Ababa', labelEn: 'Bole, Addis Ababa', labelAm: 'ቦሌ፣ አዲስ አበባ' },
  { value: 'Addis Ababa Central', labelEn: 'Addis Ababa Central (Piassa / Stadium)', labelAm: 'ማዕከላዊ አዲስ አበባ (ፒያሳ / ስታዲየም)' },
  { value: 'Kazanchis', labelEn: 'Kazanchis & Bambis', labelAm: 'ካዛንቺስ እና ባምቢስ' },
  { value: 'Kirkos', labelEn: 'Kirkos / Mexico / Gotera', labelAm: 'ቂርቆስ / ሜክሲኮ / ጎተራ' },
  { value: 'Yeka / CMC', labelEn: 'Yeka / CMC / Megenagna', labelAm: 'የካ / ሲኤምሲ / መገናኛ' },
  { value: 'Lideta', labelEn: 'Lideta & Tor Hailoch', labelAm: 'ልደታ እና ጦር ኃይሎች' },
  { value: 'Nifas Silk', labelEn: 'Nifas Silk / Lafto / Jemo', labelAm: 'ንፋስ ስልክ / ላፍቶ / ጀሞ' },
  { value: 'Arada', labelEn: 'Arada / 4 Kilo / 6 Kilo', labelAm: 'አራዳ / 4 ኪሎ / 6 ኪሎ' },
  { value: 'Gullele', labelEn: 'Gullele / Shiromeda', labelAm: 'ጉለሌ / ሽሮሜዳ' },
  { value: 'Kolfe Keranio', labelEn: 'Kolfe Keranio', labelAm: 'ኮልፌ ቀራንዮ' },
  { value: 'Akaki Kality', labelEn: 'Akaki Kality / Saris', labelAm: 'አቃቂ ቃሊቲ / ሳሪስ' },
]

export function AccountModal({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  orders,
  onTrackOrder,
  onOpenWishlist,
  wishlistCount,
  onOpenTerms,
  isAm = false
}: AccountModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('profile')
  const [isRegistering, setIsRegistering] = useState(false)

  // Auth form states
  const [emailInput, setEmailInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const [subcityInput, setSubcityInput] = useState('Bole, Addis Ababa')

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)

  // Profile Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editName, setEditName] = useState(user?.name || '')
  const [editPhone, setEditPhone] = useState(user?.phone || '')
  const [editSubcity, setEditSubcity] = useState(user?.subcity || 'Bole, Addis Ababa')
  const [profileUpdateError, setProfileUpdateError] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Address CRUD states
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [addrLabel, setAddrLabel] = useState('Home')
  const [addrRecipient, setAddrRecipient] = useState(user?.name || '')
  const [addrPhone, setAddrPhone] = useState(user?.phone || '')
  const [addrSubcity, setAddrSubcity] = useState('Bole, Addis Ababa')
  const [addrStreet, setAddrStreet] = useState('')
  const [addrLandmark, setAddrLandmark] = useState('')

  const [authError, setAuthError] = useState('')
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false)

  // Real-time password strength calculation
  const passwordStrength = useMemo(() => {
    return validatePasswordStrength(passwordInput)
  }, [passwordInput])

  if (!isOpen) return null

  // Sign In Handler with API Auth & Validation
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    if (!emailInput.trim() || !passwordInput.trim()) {
      setAuthError(isAm ? 'እባክዎ ኢሜይል እና የይለፍ ቃል ያስገቡ።' : 'Please enter both email address and password.')
      return
    }

    setIsSubmittingAuth(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: emailInput.trim(),
          password: passwordInput.trim()
        })
      })

      const data = await res.json()
      if (res.ok && data.success && data.user) {
        onUpdateUser(data.user)
        setIsSubmittingAuth(false)
        return
      } else {
        setAuthError(data.error || (isAm ? 'ትክክለኛ ያልሆነ ኢሜይል ወይም የይለፍ ቃል ነው።' : 'Invalid email or password.'))
        setIsSubmittingAuth(false)
        return
      }
    } catch (err) {
      setAuthError(isAm ? 'የማረጋገጫ አገልግሎት ለጊዜው አልተገኘም። እባክዎ እንደገና ይሞክሩ።' : 'Authentication service is currently unavailable. Please try again.')
      setIsSubmittingAuth(false)
    }
  }

  // Register / Create Account Handler with Deep Validation
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')

    if (!nameInput.trim()) {
      setAuthError(isAm ? 'እባክዎ ሙሉ ስምዎን ያስገቡ።' : 'Please enter your full name.')
      return
    }
    if (!emailInput.trim() || !emailInput.includes('@') || !emailInput.includes('.')) {
      setAuthError(isAm ? 'እባክዎ ትክክለኛ የኢሜይል አድራሻ ያስገቡ።' : 'Please enter a valid email address.')
      return
    }
    if (!phoneInput.trim()) {
      setAuthError(isAm ? 'እባክዎ ስልክ ቁጥርዎን ያስገቡ።' : 'Please enter your phone number. Each account must have a unique phone number.')
      return
    }
    if (!isValidEthiopianPhone(phoneInput)) {
      setAuthError(
        isAm
          ? 'እባክዎ ትክክለኛ የኢትዮጵያ ስልክ ቁጥር ያስገቡ (ለምሳሌ 091 123 4567 ወይም +251 91 123 4567)።'
          : 'Please enter a valid Ethiopian phone number (e.g., 091 123 4567 or +251 91 123 4567).'
      )
      return
    }

    const pwCheck = validatePasswordStrength(passwordInput)
    if (!pwCheck.isValid) {
      setAuthError(
        pwCheck.error ||
          (isAm
            ? 'የይለፍ ቃል ቢያንስ 8 ፊደላት እና ቁጥሮች ሊኖሩት ይገባል።'
            : 'Password must be at least 8 characters long and contain both letters and numbers.')
      )
      return
    }

    setIsSubmittingAuth(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          name: nameInput.trim(),
          email: emailInput.trim(),
          password: passwordInput,
          phone: phoneInput.trim(),
          subcity: subcityInput || 'Bole, Addis Ababa'
        })
      })

      const data = await res.json()
      if (res.ok && data.success && data.user) {
        onUpdateUser(data.user)
        setIsSubmittingAuth(false)
        return
      } else {
        setAuthError(data.error || (isAm ? 'መለያ መፍጠር አልተሳካም። እባክዎ መረጃዎን ይፈትሹ።' : 'Registration failed. Please check your details.'))
        setIsSubmittingAuth(false)
        return
      }
    } catch (err) {
      setAuthError(isAm ? 'የምዝገባ አገልግሎት ለጊዜው አልተገኘም። እባክዎ እንደገና ይሞክሩ።' : 'Registration service is currently unavailable. Please try again.')
      setIsSubmittingAuth(false)
    }
  }

  // Update Profile (Full CRUD Update with DB verification of unique phone)
  const handleSaveProfile = async () => {
    if (!user) return
    setProfileUpdateError('')

    if (!editName.trim()) {
      setProfileUpdateError(isAm ? 'ሙሉ ስም ባዶ መሆን አይችልም።' : 'Full name cannot be blank.')
      return
    }
    if (!editPhone.trim()) {
      setProfileUpdateError(isAm ? 'ስልክ ቁጥር ባዶ መሆን አይችልም።' : 'Phone number cannot be blank.')
      return
    }
    if (!isValidEthiopianPhone(editPhone)) {
      setProfileUpdateError(
        isAm
          ? 'እባክዎ ትክክለኛ የኢትዮጵያ ስልክ ቁጥር ያስገቡ (ለምሳሌ 091 123 4567)።'
          : 'Please enter a valid Ethiopian phone number (e.g., 091 123 4567 or +251 91 123 4567).'
      )
      return
    }

    setIsSavingProfile(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-profile',
          userId: user.id,
          name: editName.trim(),
          phone: editPhone.trim(),
          subcity: editSubcity,
          addresses: user.addresses
        })
      })

      const data = await res.json()
      if (res.ok && data.success && data.user) {
        onUpdateUser(data.user)
        setIsEditingProfile(false)
        setProfileUpdateError('')
      } else {
        setProfileUpdateError(data.error || (isAm ? 'መገለጫ ማደስ አልተሳካም። እባክዎ እንደገና ይሞክሩ።' : 'Failed to update profile. Please try again.'))
      }
    } catch (err) {
      setProfileUpdateError(isAm ? 'ለውጦችን ማስቀመጥ አልተቻለም። እባክዎ እንደገና ይሞክሩ።' : 'Unable to save profile changes right now. Please try again.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Address CRUD: Add or Update Address
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (editingAddressId) {
      const updatedAddrs = user.addresses.map((a) =>
        a.id === editingAddressId
          ? {
              ...a,
              label: addrLabel,
              recipient: addrRecipient,
              phone: addrPhone,
              subcity: addrSubcity,
              street: addrStreet,
              landmark: addrLandmark
            }
          : a
      )
      onUpdateUser({ ...user, addresses: updatedAddrs })
      setEditingAddressId(null)
    } else {
      const newAddr: Address = {
        id: 'addr_' + Date.now(),
        label: addrLabel || 'Address',
        recipient: addrRecipient || user.name,
        phone: addrPhone || user.phone,
        subcity: addrSubcity,
        street: addrStreet || 'Street in Addis',
        landmark: addrLandmark,
        isDefault: user.addresses.length === 0
      }
      onUpdateUser({ ...user, addresses: [...user.addresses, newAddr] })
      setIsAddingAddress(false)
    }
    setAddrStreet('')
    setAddrLandmark('')
  }

  // Address CRUD: Delete Address
  const handleDeleteAddress = (id: string) => {
    if (!user) return
    const filtered = user.addresses.filter((a) => a.id !== id)
    onUpdateUser({ ...user, addresses: filtered })
  }

  // Address CRUD: Set Default Address
  const handleSetDefaultAddress = (id: string) => {
    if (!user) return
    const updated = user.addresses.map((a) => ({
      ...a,
      isDefault: a.id === id
    }))
    onUpdateUser({ ...user, addresses: updated })
  }

  return (
    <div
      className="modal-backdrop account-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={user ? 'Account Management' : isRegistering ? 'Create Ride Addis Account' : 'Sign In to Ride Addis'}
    >
      <div
        className={`modal-shell account-modal ${!user ? 'account-modal-auth' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull / Drag Indicator for Bottom Sheet Feel */}
        <div className="account-modal-drag-bar" aria-hidden="true" onClick={onClose}>
          <span className="drag-indicator-pill" />
        </div>

        {/* Modal Top Header Bar with Never-Colliding Close Action */}
        <div className="account-modal-header">
          <div className="account-modal-badge">
            <ShieldCheck size={14} className="text-amber-500" />
            <span>{isAm ? 'የተጠበቀ መለያ' : 'RIDE ADDIS SECURE ACCESS'}</span>
          </div>
          <button
            type="button"
            className="account-modal-close-btn"
            onClick={onClose}
            aria-label={isAm ? 'ዝጋ' : 'Close Account Modal'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="account-modal-body">
          {!user ? (
            // ================= 1. AUTHENTICATION VIEW (SIGN IN / CREATE ACCOUNT) =================
            <div className="ga-shell">
              {/* Floating glass close button */}
              <button
                type="button"
                className="ga-close"
                onClick={onClose}
                aria-label={isAm ? 'ዝጋ' : 'Close'}
              >
                <X size={16} />
              </button>

              {/* ---------- Visual brand panel ---------- */}
              <section className="ga-visual" aria-hidden="true">
                <div className="ga-photo" />
                <div className="ga-brand-row">
                  <span className="ga-brand">
                    RIDE <em>ADDIS</em>
                  </span>
                  <span className="ga-secure-pill">
                    <ShieldCheck size={11} />
                    {isAm ? 'የተጠበቀ' : 'Secure access'}
                  </span>
                </div>

                <div className="ga-visual-body">
                  <div className="ga-visual-copy">
                    <span className="ga-kicker">
                      {isAm ? 'አዲስ አበባ · ፕሪሚየም ሳይክሊንግ' : 'ADDIS ABABA · PREMIUM CYCLING'}
                    </span>
                    <h3 className="ga-title">
                      {isAm ? 'ከፍተኛውን ከተማ' : 'Ride the'}
                      <span>{isAm ? 'ይጋልቡ' : 'high city.'}</span>
                    </h3>
                    <p className="ga-lede">
                      {isAm
                        ? 'ጥራት ያላቸው ብስክሌቶች፣ በአዲስ አበባ ወርክሾፓችን ተገጣጥመው ወደ ቤትዎ ይደርሳሉ — ለሁሉም ፍሬም የዕድሜ ልክ አገልግሎት።'
                        : 'Premium bicycles, assembled in our Addis workshop and delivered to your door — with lifetime service on every frame.'}
                    </p>
                  </div>

                  <div className="ga-proof-grid">
                    <div className="ga-proof">
                      <strong>5.0★</strong>
                      <small>{isAm ? 'የGoogle ደረጃ' : 'Google rating'}</small>
                    </div>
                    <div className="ga-proof">
                      <strong>{isAm ? 'ነጻ' : 'Free'}</strong>
                      <small>{isAm ? 'የአዲስ አበባ ማድረስ' : 'Addis delivery'}</small>
                    </div>
                    <div className="ga-proof">
                      <strong>100%</strong>
                      <small>{isAm ? 'ተገጣጥሞ ተጣርቷል' : 'Assembled & tuned'}</small>
                    </div>
                  </div>

                  <div className="ga-trust-strip">
                    <span>{isAm ? 'የዕድሜ ልክ አገልግሎት' : 'Lifetime service'}</span>
                    <i>·</i>
                    <span>{isAm ? 'የባንክ ደረጃ ምስጢር' : 'Bank-grade encryption'}</span>
                    <i>·</i>
                    <span>TeleBirr · CBE</span>
                  </div>
                </div>
              </section>

              {/* ---------- Form panel ---------- */}
              <section className="ga-form-panel">
              {/* Touch-Friendly Segmented Tab Switcher */}
              <div className="auth-segmented-switcher" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={!isRegistering}
                  className={`auth-segment-btn ${!isRegistering ? 'active' : ''}`}
                  onClick={() => {
                    setIsRegistering(false)
                    setAuthError('')
                  }}
                >
                  <LogIn size={15} />
                  <span>{isAm ? 'ግባ' : 'Sign In'}</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={isRegistering}
                  className={`auth-segment-btn ${isRegistering ? 'active' : ''}`}
                  onClick={() => {
                    setIsRegistering(true)
                    setAuthError('')
                  }}
                >
                  <UserPlus size={15} />
                  <span>{isAm ? 'መለያ ፍጠር' : 'Create Account'}</span>
                </button>
              </div>

              {/* Dynamic Header Typography */}
              <div className="ga-form-head auth-header">
                <span className="eyebrow">{isAm ? 'የአዲስ አበባ ብስክሌት ማህበረሰብ' : 'RIDE ADDIS CYCLIST PASS'}</span>
                <h2>{isRegistering ? (isAm ? 'የራስዎን መለያ ይፍጠሩ' : 'Create Your Account') : (isAm ? 'እንኳን ደህና መጡ' : 'Sign In to Your Account')}</h2>
                <p>
                  {isRegistering
                    ? (isAm ? 'ብስክሌቶችን ለመግዛት፣ ተወዳጅ እቃዎችን ለማስቀመጥ እና በአዲስ አበባ ፈጣን ማድረሻን ለመከታተል ይመዝገቡ።' : 'Sign up to configure bicycles, save favorites, and track express deliveries across Addis Ababa.')
                    : (isAm ? 'የግዢ ቦርሳዎን ለመመልከት፣ ተወዳጆችን ለማስቀመጥ እና ትዕዛዝዎን ለመከታተል ይግቡ።' : 'Sign in to access your shopping bag, save favorites, and track your orders in real-time.')}
                </p>
              </div>

              {/* Error Notice */}
              {authError && (
                <div className="auth-error-alert" role="alert">
                  <AlertCircle size={16} className="auth-error-icon" />
                  <span className="auth-error-text">{authError}</span>
                </div>
              )}

              {/* Forms */}
              {isRegistering ? (
                // --- CREATE ACCOUNT FORM ---
                <form onSubmit={handleRegister} className="crud-form auth-form auth-form-register">
                  <label className="auth-field-label">
                    <span>{isAm ? 'ሙሉ ስም' : 'Full Name'}</span>
                    <div className="auth-input-wrapper">
                      <User size={16} className="auth-input-icon" />
                      <input
                        type="text"
                        autoComplete="name"
                        autoCapitalize="words"
                        required
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder={isAm ? 'ለምሳሌ፡ አለማየሁ ታደሰ' : 'e.g. Alazar Tadesse'}
                        className="auth-input has-left-icon"
                      />
                    </div>
                  </label>

                  <label className="auth-field-label">
                    <span>{isAm ? 'ኢሜይል አድራሻ' : 'Email Address'}</span>
                    <div className="auth-input-wrapper">
                      <Mail size={16} className="auth-input-icon" />
                      <input
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="you@example.com"
                        className="auth-input has-left-icon"
                      />
                    </div>
                  </label>

                  <label className="auth-field-label">
                    <div className="flex items-center justify-between">
                      <span>{isAm ? 'ስልክ ቁጥር' : 'Phone Number'}</span>
                      <span className="auth-hint">Ethiopian Mobile</span>
                    </div>
                    <div className="auth-input-wrapper">
                      <Phone size={16} className="auth-input-icon" />
                      <input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        required
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="091 123 4567"
                        className="auth-input has-left-icon"
                      />
                    </div>
                    {/* Quick Ethiopian Mobile Helper Chips */}
                    <div className="auth-quick-prefix">
                      <span className="text-[10px] text-stone-600">Quick prefix:</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (!phoneInput.startsWith('09')) {
                            setPhoneInput('09' + phoneInput.replace(/^(07|\+2519|\+2517|0)/, ''))
                          }
                        }}
                        className="text-[10px] bg-stone-200 hover:bg-stone-300 text-stone-800 px-2 py-0.5 rounded-md font-semibold transition"
                      >
                        09 (Ethio Tel)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!phoneInput.startsWith('07')) {
                            setPhoneInput('07' + phoneInput.replace(/^(09|\+2519|\+2517|0)/, ''))
                          }
                        }}
                        className="text-[10px] bg-stone-200 hover:bg-stone-300 text-stone-800 px-2 py-0.5 rounded-md font-semibold transition"
                      >
                        07 (Safaricom)
                      </button>
                    </div>
                  </label>

                  <label className="auth-field-label">
                    <span>{isAm ? 'የአዲስ አበባ ክፍለ ከተማ' : 'Addis Ababa Sub-city'}</span>
                    <div className="auth-select-wrapper">
                      <MapPin size={16} className="auth-input-icon" />
                      <select
                        value={subcityInput}
                        onChange={(e) => setSubcityInput(e.target.value)}
                        className="auth-select has-left-icon"
                      >
                        {ADDIS_SUBCITIES.map((sub) => (
                          <option key={sub.value} value={sub.value}>
                            {isAm ? sub.labelAm : sub.labelEn}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="auth-select-chevron" />
                    </div>
                  </label>

                  <label className="auth-field-label auth-span-2">
                    <span>{isAm ? 'የይለፍ ቃል ፍጠር' : 'Create Security Password'}</span>
                    <div className="auth-input-wrapper">
                      <Lock size={16} className="auth-input-icon" />
                      <input
                        type={showRegisterPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder={isAm ? 'ቢያንስ 8 ፊደላት እና ቁጥሮች' : 'Minimum 8 characters (letters & numbers)'}
                        className="auth-input has-left-icon has-right-icon"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="auth-password-toggle-btn"
                        aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                      >
                        {showRegisterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </label>

                  {/* Real-time Password Strength Meter */}
                  {passwordInput.length > 0 && (
                    <div className="auth-pw-strength-box auth-span-2">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-stone-600">{isAm ? 'የይለፍ ቃል ጥንካሬ:' : 'Password Strength:'}</span>
                        <span
                          className={
                            passwordStrength.score >= 3
                              ? 'text-emerald-700'
                              : passwordStrength.score === 2
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }
                        >
                          {passwordStrength.score >= 3
                            ? (isAm ? 'ጠንካራ' : 'Strong')
                            : passwordStrength.score === 2
                            ? (isAm ? 'መካከለኛ' : 'Medium')
                            : (isAm ? 'ደካማ' : 'Weak')}
                        </span>
                      </div>
                      {/* Visual Strength Progress Bar */}
                      <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden flex gap-1">
                        <div
                          className={`h-full flex-1 rounded-full transition-all ${
                            passwordStrength.score >= 1
                              ? passwordStrength.score >= 3
                                ? 'bg-emerald-500'
                                : passwordStrength.score === 2
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                              : 'bg-stone-300/40'
                          }`}
                        />
                        <div
                          className={`h-full flex-1 rounded-full transition-all ${
                            passwordStrength.score >= 2
                              ? passwordStrength.score >= 3
                                ? 'bg-emerald-500'
                                : 'bg-amber-500'
                              : 'bg-stone-300/40'
                          }`}
                        />
                        <div
                          className={`h-full flex-1 rounded-full transition-all ${
                            passwordStrength.score >= 3 ? 'bg-emerald-500' : 'bg-stone-300/40'
                          }`}
                        />
                        <div
                          className={`h-full flex-1 rounded-full transition-all ${
                            passwordStrength.score >= 4 ? 'bg-emerald-500' : 'bg-stone-300/40'
                          }`}
                        />
                      </div>
                      {/* Checklist rules */}
                      <div className="grid grid-cols-2 gap-1.5 text-[11px] text-stone-600 pt-1">
                        <div
                          className={`flex items-center gap-1.5 ${
                            passwordInput.length >= 8 ? 'text-emerald-700 font-semibold' : 'text-stone-500'
                          }`}
                        >
                          <CheckCircle2
                            size={13}
                            className={passwordInput.length >= 8 ? 'text-emerald-600' : 'text-stone-300'}
                          />
                          <span>{isAm ? '8+ ፊደላት' : '8+ characters'}</span>
                        </div>
                        <div
                          className={`flex items-center gap-1.5 ${
                            /[a-zA-Z]/.test(passwordInput) && /[0-9]/.test(passwordInput)
                              ? 'text-emerald-700 font-semibold'
                              : 'text-stone-500'
                          }`}
                        >
                          <CheckCircle2
                            size={13}
                            className={
                              /[a-zA-Z]/.test(passwordInput) && /[0-9]/.test(passwordInput)
                                ? 'text-emerald-600'
                                : 'text-stone-300'
                            }
                          />
                          <span>{isAm ? 'ፊደል እና ቁጥር' : 'Letters & numbers'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingAuth}
                    className="button button-dark full-width auth-submit-btn auth-span-2"
                  >
                    {isSubmittingAuth ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>{isAm ? 'መለያ በመፍጠር ላይ...' : 'Creating Account...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{isAm ? 'መለያ ፍጠር' : 'Create Account'}</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                // --- SIGN IN FORM ---
                <form onSubmit={handleSignIn} className="crud-form auth-form">
                  <label className="auth-field-label">
                    <span>{isAm ? 'ኢሜይል አድራሻ' : 'Email Address'}</span>
                    <div className="auth-input-wrapper">
                      <Mail size={16} className="auth-input-icon" />
                      <input
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        required
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="you@example.com"
                        className="auth-input has-left-icon"
                      />
                    </div>
                  </label>

                  <label className="auth-field-label">
                    <div className="flex justify-between items-center">
                      <span>{isAm ? 'የይለፍ ቃል' : 'Password'}</span>
                    </div>
                    <div className="auth-input-wrapper">
                      <Lock size={16} className="auth-input-icon" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder={isAm ? 'የይለፍ ቃልዎን ያስገቡ' : 'Enter your password'}
                        className="auth-input has-left-icon has-right-icon"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="auth-password-toggle-btn"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmittingAuth}
                    className="button button-dark full-width auth-submit-btn"
                  >
                    {isSubmittingAuth ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>{isAm ? 'በመግባት ላይ...' : 'Signing In...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{isAm ? 'ግባ' : 'Sign In'}</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Action Switcher & Policy Notice */}
              <div className="auth-footer-actions">
                <button
                  type="button"
                  className="auth-switch-mode-btn"
                  onClick={() => {
                    setIsRegistering(!isRegistering)
                    setAuthError('')
                  }}
                >
                  {isRegistering
                    ? (isAm ? 'አስቀድመው መለያ አለዎት? ይግቡ' : 'Already have an account? Sign In')
                    : (isAm ? 'መለያ የለዎትም? አዲስ ይፍጠሩ' : "Don't have an account? Create one")}
                </button>
                <p className="auth-terms-note">
                  {isAm ? 'በመቀጠልዎ፣ የRide Addisን ' : 'By continuing, you agree to Ride Addis '}
                  <button
                    type="button"
                    className="auth-terms-link"
                    onClick={() => onOpenTerms && onOpenTerms()}
                  >
                    {isAm ? 'የአገልግሎት እና የግላዊነት ደንቦች' : 'Terms of Service & Privacy Policy'}
                  </button>
                  {isAm ? ' ተስማምተዋል።' : '.'}
                </p>
              </div>
              <div className="ga-secure-foot">
                <span>
                  <ShieldCheck size={12} />
                  {isAm ? '256-bit ምስጠራ' : '256-bit encryption'}
                </span>
                <i className="dot" />
                <span>{isAm ? 'ቴሌብር · CBE · ጥሬ ገንዘብ' : 'TeleBirr · CBE · Cash on delivery'}</span>
              </div>
              </section>
            </div>
          ) : (
            // ================= 2. LOGGED IN ACCOUNT DASHBOARD (FULL CRUD) =================
            <div className="account-dashboard">
              <div className="dashboard-top">
                <div className="dashboard-user-meta">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-11 h-11 rounded-full bg-[#171817] text-amber-400 font-serif text-lg font-bold flex items-center justify-center flex-shrink-0 shadow-md border border-amber-400/30">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="eyebrow">{isAm ? 'የተረጋገጠ ሳይክሊስት' : 'VERIFIED CYCLIST'}</span>
                      <h2 className="text-xl sm:text-2xl font-serif text-stone-900 leading-tight m-0">{user.name}</h2>
                    </div>
                  </div>
                  <p className="user-email-tag">{user.email} · {user.subcity}</p>
                </div>
                <button
                  className="button-ghost logout-btn"
                  onClick={() => onUpdateUser(null)}
                  title={isAm ? 'ውጣ' : 'Sign Out'}
                >
                  <LogOut size={15} /> {isAm ? 'ውጣ' : 'Sign Out'}
                </button>
              </div>

              {/* Dashboard Navigation Tabs */}
              <div className="account-tabs">
                <button
                  className={activeTab === 'profile' ? 'active' : ''}
                  onClick={() => setActiveTab('profile')}
                >
                  <UserRound size={15} /> {isAm ? 'መገለጫ እና ቅንብሮች' : 'Profile & Settings'}
                </button>
                <button
                  className={activeTab === 'addresses' ? 'active' : ''}
                  onClick={() => setActiveTab('addresses')}
                >
                  <MapPin size={15} /> {isAm ? 'አድራሻዎች' : 'Addresses'} ({user.addresses.length})
                </button>
                <button
                  className={activeTab === 'orders' ? 'active' : ''}
                  onClick={() => setActiveTab('orders')}
                >
                  <Package size={15} /> {isAm ? 'ትዕዛዞች' : 'Orders'} ({orders.length})
                </button>
              </div>

              {/* TAB 1: PROFILE CRUD */}
              {activeTab === 'profile' && (
                <div className="tab-content profile-tab">
                  {!isEditingProfile ? (
                    <div className="profile-display-card">
                      <div className="profile-meta-grid">
                        <div className="profile-meta-item">
                          <small>{isAm ? 'ሙሉ ስም' : 'FULL NAME'}</small>
                          <strong className="meta-val">{user.name}</strong>
                        </div>
                        <div className="profile-meta-item">
                          <small>{isAm ? 'ስልክ ቁጥር' : 'PHONE NUMBER'}</small>
                          <strong className="meta-val">{user.phone}</strong>
                        </div>
                        <div className="profile-meta-item">
                          <small>{isAm ? 'ኢሜይል አድራሻ' : 'EMAIL ADDRESS'}</small>
                          <strong className="meta-val">{user.email}</strong>
                        </div>
                        <div className="profile-meta-item">
                          <small>{isAm ? 'ክፍለ ከተማ' : 'DEFAULT SUB-CITY'}</small>
                          <strong className="meta-val">{user.subcity}</strong>
                        </div>
                      </div>
                      <div className="profile-actions-bar">
                        <button
                          className="button button-dark"
                          onClick={() => {
                            setEditName(user.name)
                            setEditPhone(user.phone)
                            setEditSubcity(user.subcity)
                            setIsEditingProfile(true)
                          }}
                        >
                          <Edit2 size={15} /> {isAm ? 'መገለጫ አድስ' : 'Edit Cyclist Profile'}
                        </button>
                        <button
                          className="button button-outline"
                          onClick={() => {
                            onClose()
                            onOpenWishlist()
                          }}
                        >
                          <Heart size={15} /> {isAm ? 'ተወዳጆች' : 'Saved Wishlist'} ({wishlistCount})
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="crud-edit-box">
                      <h3>{isAm ? 'መገለጫ አድስ' : 'Edit Cyclist Profile'}</h3>

                      {profileUpdateError && (
                        <div className="auth-error-alert mb-3">
                          <AlertCircle size={15} className="auth-error-icon" />
                          <span className="auth-error-text">{profileUpdateError}</span>
                        </div>
                      )}

                      <div className="crud-form">
                        <label className="auth-field-label">
                          <span>{isAm ? 'ሙሉ ስም' : 'Full Name'}</span>
                          <input
                            type="text"
                            required
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="auth-input"
                          />
                        </label>
                        <label className="auth-field-label">
                          <span>{isAm ? 'ስልክ ቁጥር' : 'Phone Number'}</span>
                          <input
                            type="tel"
                            inputMode="tel"
                            required
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            placeholder="091 123 4567 or +251 91 123 4567"
                            className="auth-input"
                          />
                        </label>
                        <label className="auth-field-label">
                          <span>{isAm ? 'የአዲስ አበባ ክፍለ ከተማ' : 'Addis Ababa Sub-city'}</span>
                          <select
                            value={editSubcity}
                            onChange={(e) => setEditSubcity(e.target.value)}
                            className="auth-select"
                          >
                            {ADDIS_SUBCITIES.map((sub) => (
                              <option key={sub.value} value={sub.value}>
                                {isAm ? sub.labelAm : sub.labelEn}
                              </option>
                            ))}
                          </select>
                        </label>
                        <div className="btn-group">
                          <button
                            className="button button-dark disabled:opacity-50"
                            disabled={isSavingProfile}
                            onClick={handleSaveProfile}
                          >
                            <Check size={16} /> {isSavingProfile ? (isAm ? 'በማስቀመጥ ላይ...' : 'Saving...') : (isAm ? 'አስቀምጥ' : 'Save Changes')}
                          </button>
                          <button
                            className="button button-ghost"
                            onClick={() => {
                              setIsEditingProfile(false)
                              setProfileUpdateError('')
                            }}
                          >
                            {isAm ? 'ሰርዝ' : 'Cancel'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ADDRESSES CRUD */}
              {activeTab === 'addresses' && (
                <div className="tab-content addresses-tab">
                  <div className="tab-header-row">
                    <div>
                      <h3 className="m-0 text-lg sm:text-xl font-serif text-stone-900">{isAm ? 'የማድረሻ አድራሻዎች' : 'Saved Delivery Locations'}</h3>
                      <p className="text-xs text-stone-500 m-0 mt-1">{isAm ? 'ብስክሌቶች የሚደርሱባቸው ቦታዎች።' : 'Where express dispatch vehicles deliver your assembled bicycles.'}</p>
                    </div>
                    {!isAddingAddress && !editingAddressId && (
                      <button
                        className="button button-dark"
                        onClick={() => {
                          setIsAddingAddress(true)
                          setAddrLabel('Home')
                          setAddrRecipient(user.name)
                          setAddrPhone(user.phone)
                          setAddrSubcity('Bole, Addis Ababa')
                          setAddrStreet('')
                          setAddrLandmark('')
                        }}
                      >
                        <Plus size={16} /> {isAm ? 'አዲስ አድራሻ' : 'Add Address'}
                      </button>
                    )}
                  </div>

                  {/* Form to Add or Edit an Address */}
                  {(isAddingAddress || editingAddressId) && (
                    <form onSubmit={handleSaveAddress} className="crud-form address-form-box">
                      <h4 className="font-serif text-base text-stone-900 mb-2">
                        {editingAddressId ? (isAm ? 'አድራሻ አድስ' : 'Edit Address') : (isAm ? 'አዲስ የማድረሻ አድራሻ አክል' : 'Add New Delivery Address')}
                      </h4>
                      <label className="auth-field-label">
                        <span>{isAm ? 'የአድራሻ ስም (ቤት / ቢሮ)' : 'Address Label'}</span>
                        <input
                          type="text"
                          required
                          value={addrLabel}
                          onChange={(e) => setAddrLabel(e.target.value)}
                          placeholder="e.g. Home, Work, Studio"
                          className="auth-input"
                        />
                      </label>
                      <label className="auth-field-label">
                        <span>{isAm ? 'ተቀባይ ስም' : 'Recipient Name'}</span>
                        <input
                          type="text"
                          required
                          value={addrRecipient}
                          onChange={(e) => setAddrRecipient(e.target.value)}
                          placeholder="e.g. Dawit Haile"
                          className="auth-input"
                        />
                      </label>
                      <label className="auth-field-label">
                        <span>{isAm ? 'ስልክ ቁጥር' : 'Phone Number'}</span>
                        <input
                          type="tel"
                          inputMode="tel"
                          required
                          value={addrPhone}
                          onChange={(e) => setAddrPhone(e.target.value)}
                          placeholder="+251 91 123 4567"
                          className="auth-input"
                        />
                      </label>
                      <label className="auth-field-label">
                        <span>{isAm ? 'ክፍለ ከተማ' : 'Addis Ababa Sub-city'}</span>
                        <select
                          value={addrSubcity}
                          onChange={(e) => setAddrSubcity(e.target.value)}
                          className="auth-select"
                        >
                          {ADDIS_SUBCITIES.map((sub) => (
                            <option key={sub.value} value={sub.value}>
                              {isAm ? sub.labelAm : sub.labelEn}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="auth-field-label">
                        <span>{isAm ? 'መንገድ እና ቤት / ሕንፃ' : 'Street & House / Building'}</span>
                        <input
                          type="text"
                          required
                          value={addrStreet}
                          onChange={(e) => setAddrStreet(e.target.value)}
                          placeholder="e.g. Namibia St, Near Medhanialem"
                          className="auth-input"
                        />
                      </label>
                      <label className="auth-field-label">
                        <span>{isAm ? 'መለያ ምልክት (አማራጭ)' : 'Landmark (Optional)'}</span>
                        <input
                          type="text"
                          value={addrLandmark}
                          onChange={(e) => setAddrLandmark(e.target.value)}
                          placeholder="e.g. Behind Edna Mall, 2nd gate"
                          className="auth-input"
                        />
                      </label>
                      <div className="btn-group">
                        <button type="submit" className="button button-dark">
                          <Check size={16} /> {isAm ? 'አስቀምጥ' : 'Save Address'}
                        </button>
                        <button
                          type="button"
                          className="button button-ghost"
                          onClick={() => {
                            setIsAddingAddress(false)
                            setEditingAddressId(null)
                          }}
                        >
                          {isAm ? 'ሰርዝ' : 'Cancel'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List of Saved Addresses */}
                  <div className="address-cards-grid">
                    {user.addresses.map((addr) => (
                      <div key={addr.id} className={`address-card ${addr.isDefault ? 'is-default' : ''}`}>
                        <div className="address-card-header">
                          <strong className="text-stone-900">{addr.label}</strong>
                          {addr.isDefault && <span className="default-pill">{isAm ? 'ዋና አድራሻ' : 'Default'}</span>}
                        </div>
                        <p className="addr-recipient"><strong>{addr.recipient}</strong> · {addr.phone}</p>
                        <p className="addr-location">{addr.street}, {addr.subcity}</p>
                        {addr.landmark && <p className="addr-landmark">{isAm ? 'መለያ:' : 'Landmark:'} {addr.landmark}</p>}
                        <div className="address-card-actions">
                          {!addr.isDefault && (
                            <button
                              type="button"
                              className="text-link"
                              onClick={() => handleSetDefaultAddress(addr.id)}
                            >
                              {isAm ? 'ዋና አድርግ' : 'Set as default'}
                            </button>
                          )}
                          <button
                            type="button"
                            className="icon-link"
                            onClick={() => {
                              setEditingAddressId(addr.id)
                              setAddrLabel(addr.label)
                              setAddrRecipient(addr.recipient)
                              setAddrPhone(addr.phone)
                              setAddrSubcity(addr.subcity)
                              setAddrStreet(addr.street)
                              setAddrLandmark(addr.landmark || '')
                            }}
                            title={isAm ? 'አድስ' : 'Edit'}
                          >
                            <Edit2 size={14} />
                          </button>
                          {user.addresses.length > 1 && (
                            <button
                              type="button"
                              className="icon-link text-danger"
                              onClick={() => handleDeleteAddress(addr.id)}
                              title={isAm ? 'አጥፋ' : 'Delete'}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: ORDER HISTORY */}
              {activeTab === 'orders' && (
                <div className="tab-content orders-tab">
                  <h3 className="m-0 text-lg sm:text-xl font-serif text-stone-900 mb-3">{isAm ? 'የእርስዎ ትዕዛዞች' : 'My Bicycle & Gear Orders'}</h3>
                  {orders.length === 0 ? (
                    <p className="empty-notice">{isAm ? 'እስካሁን ምንም ትዕዛዝ የለም።' : 'You have no active orders. Discover our collection to place your first order!'}</p>
                  ) : (
                    <div className="orders-list">
                      {orders.map((ord) => (
                        <div key={ord.id} className="order-history-card">
                          <div className="order-card-header">
                            <div>
                              <strong className="text-stone-900">Order #{ord.id}</strong>
                              <small className="order-date">{ord.date}</small>
                            </div>
                            <span className={`status-badge status-${ord.status}`}>
                              {ord.status.replace(/_/g, ' ').toUpperCase()}
                            </span>
                          </div>
                          <div className="order-items-preview">
                            {ord.items.map((it, idx) => (
                              <div key={idx} className="order-preview-row">
                                <span>{it.quantity}x {it.name}</span>
                                <strong>ETB {(it.price * it.quantity).toLocaleString()}</strong>
                              </div>
                            ))}
                          </div>
                          <div className="order-card-footer">
                            <div>
                              <small>{isAm ? 'ጠቅላላ ዋጋ' : 'TOTAL AMOUNT'}</small>
                              <strong className="order-total-price">ETB {ord.total.toLocaleString()}</strong>
                            </div>
                            <button
                              className="button button-dark"
                              onClick={() => {
                                onClose()
                                onTrackOrder(ord.id)
                              }}
                            >
                              <Package size={15} /> {isAm ? 'የትዕዛዝ ሂደት ተከታተል' : 'Track Live Progress'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
