'use client'

import React, { useState, useMemo } from 'react'
import { X, UserRound, MapPin, Package, Heart, LogOut, Plus, Trash2, Edit2, Check, ArrowRight, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react'
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
}

export function AccountModal({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  orders,
  onTrackOrder,
  onOpenWishlist,
  wishlistCount,
  onOpenTerms
}: AccountModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('profile')
  const [isRegistering, setIsRegistering] = useState(false)

  // Auth form states
  const [emailInput, setEmailInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [phoneInput, setPhoneInput] = useState('')
  const [subcityInput, setSubcityInput] = useState('Addis Ababa')

  // Profile Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editName, setEditName] = useState(user?.name || '')
  const [editPhone, setEditPhone] = useState(user?.phone || '')
  const [editSubcity, setEditSubcity] = useState(user?.subcity || 'Addis Ababa')
  const [profileUpdateError, setProfileUpdateError] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Address CRUD states
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [addrLabel, setAddrLabel] = useState('Home')
  const [addrRecipient, setAddrRecipient] = useState(user?.name || '')
  const [addrPhone, setAddrPhone] = useState(user?.phone || '')
  const [addrSubcity, setAddrSubcity] = useState('Addis Ababa')
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
      setAuthError('Please enter both email address and password.')
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
        setAuthError(data.error || 'Invalid email or password.')
        setIsSubmittingAuth(false)
        return
      }
    } catch (err) {
      setAuthError('Authentication service is currently unavailable. Please try again.')
      setIsSubmittingAuth(false)
    }
  }

  // Register / Create Account Handler with Deep Validation
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')

    if (!nameInput.trim()) {
      setAuthError('Please enter your full name.')
      return
    }
    if (!emailInput.trim() || !emailInput.includes('@') || !emailInput.includes('.')) {
      setAuthError('Please enter a valid email address.')
      return
    }
    if (!phoneInput.trim()) {
      setAuthError('Please enter your phone number. Each account must have a unique phone number.')
      return
    }
    if (!isValidEthiopianPhone(phoneInput)) {
      setAuthError('Please enter a valid Ethiopian phone number (e.g., 091 123 4567 or +251 91 123 4567).')
      return
    }

    const pwCheck = validatePasswordStrength(passwordInput)
    if (!pwCheck.isValid) {
      setAuthError(pwCheck.error || 'Password must be at least 8 characters long and contain both letters and numbers.')
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
          subcity: subcityInput || 'Addis Ababa'
        })
      })

      const data = await res.json()
      if (res.ok && data.success && data.user) {
        onUpdateUser(data.user)
        setIsSubmittingAuth(false)
        return
      } else {
        setAuthError(data.error || 'Registration failed. Please check your details.')
        setIsSubmittingAuth(false)
        return
      }
    } catch (err) {
      setAuthError('Registration service is currently unavailable. Please try again.')
      setIsSubmittingAuth(false)
    }
  }

  // Update Profile (Full CRUD Update with DB verification of unique phone)
  const handleSaveProfile = async () => {
    if (!user) return
    setProfileUpdateError('')

    if (!editName.trim()) {
      setProfileUpdateError('Full name cannot be blank.')
      return
    }
    if (!editPhone.trim()) {
      setProfileUpdateError('Phone number cannot be blank.')
      return
    }
    if (!isValidEthiopianPhone(editPhone)) {
      setProfileUpdateError('Please enter a valid Ethiopian phone number (e.g., 091 123 4567 or +251 91 123 4567).')
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
        setProfileUpdateError(data.error || 'Failed to update profile. Please try again.')
      }
    } catch (err) {
      setProfileUpdateError('Unable to save profile changes right now. Please try again.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Address CRUD: Add or Update Address
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (editingAddressId) {
      // Update existing
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
      // Create new
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
    // reset fields
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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-shell account-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close Account Modal">
          <X size={20} />
        </button>

        {!user ? (
          // ================= AUTHENTICATION VIEW (SIGN IN / CREATE ACCOUNT) =================
          <div className="auth-container">
            {/* Prominent Tab Switcher between Sign In and Create Account */}
            <div className="auth-tab-switcher">
              <button
                type="button"
                className={`auth-tab-btn ${!isRegistering ? 'active' : ''}`}
                onClick={() => setIsRegistering(false)}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`auth-tab-btn ${isRegistering ? 'active' : ''}`}
                onClick={() => setIsRegistering(true)}
              >
                Create Account
              </button>
            </div>

            <div className="auth-header">
              <span className="eyebrow">RIDE ADDIS ACCOUNT</span>
              <h2>{isRegistering ? 'Create Your Account' : 'Sign In to Your Account'}</h2>
              <p>
                {isRegistering
                  ? 'Sign up to add bicycles to your shopping bag, save your favorites, and track deliveries across Addis Ababa.'
                  : 'Sign in to access your shopping bag, save favorites, and track your orders in real-time.'}
              </p>
            </div>

            {authError && (
              <div className="text-red-600 text-xs py-2.5 px-3 bg-red-50 rounded-xl border border-red-200 mb-4 flex items-center gap-2">
                <AlertCircle size={15} className="flex-shrink-0 text-red-500" />
                <span className="font-semibold leading-tight">{authError}</span>
              </div>
            )}

            {isRegistering ? (
              <form onSubmit={handleRegister} className="crud-form">
                <label>
                  <span>Full Name</span>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. Alazar Tadesse"
                  />
                </label>
                <label>
                  <span>Email Address</span>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="cyclist@example.com"
                  />
                </label>
                <label>
                  <span>Phone Number</span>
                  <input
                    type="tel"
                    required
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="091 123 4567 or +251 91 123 4567"
                  />
                </label>
                <label>
                  <span>Addis Ababa Sub-city</span>
                  <select value={subcityInput} onChange={(e) => setSubcityInput(e.target.value)}>
                    <option value="Bole, Addis Ababa">Bole, Addis Ababa</option>
                    <option value="Addis Ababa Central">Addis Ababa Central</option>
                    <option value="Kazanchis">Kazanchis</option>
                    <option value="Kirkos">Kirkos</option>
                    <option value="Yeka / CMC">Yeka / CMC</option>
                    <option value="Lideta">Lideta</option>
                    <option value="Nifas Silk">Nifas Silk</option>
                    <option value="Arada">Arada</option>
                  </select>
                </label>
                <label>
                  <span>Create Security Password</span>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Minimum 8 characters (letters & numbers)"
                  />
                </label>

                {/* Real-time Password Strength Meter */}
                {passwordInput.length > 0 && (
                  <div className="bg-stone-100 p-3 rounded-xl border border-stone-200 space-y-2 text-xs mb-2">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-stone-600">Password Strength:</span>
                      <span className={
                        passwordStrength.score >= 3 ? 'text-emerald-600' :
                        passwordStrength.score === 2 ? 'text-amber-600' : 'text-red-600'
                      }>
                        {passwordStrength.score >= 3 ? 'Strong' : passwordStrength.score === 2 ? 'Medium' : 'Weak'}
                      </span>
                    </div>
                    {/* Visual Strength Progress Bar */}
                    <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 1 ? (passwordStrength.score >= 3 ? 'bg-emerald-500' : passwordStrength.score === 2 ? 'bg-amber-500' : 'bg-red-500') : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 2 ? (passwordStrength.score >= 3 ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 3 ? 'bg-emerald-500' : 'bg-transparent'}`} />
                      <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 4 ? 'bg-emerald-500' : 'bg-transparent'}`} />
                    </div>
                    {/* Checklist rules */}
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] text-stone-600 pt-1">
                      <div className={`flex items-center gap-1 ${passwordInput.length >= 8 ? 'text-emerald-600 font-semibold' : 'text-stone-500'}`}>
                        <CheckCircle2 size={12} className={passwordInput.length >= 8 ? 'text-emerald-600' : 'text-stone-300'} />
                        8+ characters
                      </div>
                      <div className={`flex items-center gap-1 ${(/[a-zA-Z]/.test(passwordInput) && /[0-9]/.test(passwordInput)) ? 'text-emerald-600 font-semibold' : 'text-stone-500'}`}>
                        <CheckCircle2 size={12} className={(/[a-zA-Z]/.test(passwordInput) && /[0-9]/.test(passwordInput)) ? 'text-emerald-600' : 'text-stone-300'} />
                        Letters & numbers
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingAuth}
                  className="button button-dark full-width disabled:opacity-50"
                >
                  {isSubmittingAuth ? 'Creating Account...' : 'Create Account'} <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignIn} className="crud-form">
                <label>
                  Email Address
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Email"
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Password"
                  />
                </label>
                <button type="submit" className="button button-dark full-width">
                  Sign In <ArrowRight size={16} />
                </button>
              </form>
            )}

            <div className="auth-footer-actions">
              <button
                type="button"
                className="text-link"
                onClick={() => {
                  setIsRegistering(!isRegistering)
                  setAuthError('')
                }}
              >
                {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
              </button>
              <p className="auth-terms-note">
                By continuing, you agree to Ride Addis{' '}
                <button
                  type="button"
                  className="auth-terms-link"
                  onClick={() => onOpenTerms && onOpenTerms()}
                >
                  Terms of Service & Privacy Policy
                </button>
                .
              </p>
            </div>
          </div>
        ) : (
          // ================= LOGGED IN ACCOUNT DASHBOARD (FULL CRUD) =================
          <div className="account-dashboard">
            <div className="dashboard-top pr-16 sm:pr-16">
              <div className="dashboard-user-meta">
                <span className="eyebrow">VERIFIED CYCLIST</span>
                <h2>{user.name}</h2>
                <p className="user-email-tag">{user.email} · {user.subcity}, Addis Ababa</p>
              </div>
              <button
                className="button-ghost logout-btn mr-2"
                onClick={() => onUpdateUser(null)}
                title="Log Out"
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>

            {/* Dashboard Tabs */}
            <div className="account-tabs">
              <button
                className={activeTab === 'profile' ? 'active' : ''}
                onClick={() => setActiveTab('profile')}
              >
                <UserRound size={15} /> Profile & Settings
              </button>
              <button
                className={activeTab === 'addresses' ? 'active' : ''}
                onClick={() => setActiveTab('addresses')}
              >
                <MapPin size={15} /> Delivery Addresses ({user.addresses.length})
              </button>
              <button
                className={activeTab === 'orders' ? 'active' : ''}
                onClick={() => setActiveTab('orders')}
              >
                <Package size={15} /> Order History ({orders.length})
              </button>
            </div>

            {/* TAB 1: PROFILE CRUD */}
            {activeTab === 'profile' && (
              <div className="tab-content profile-tab">
                {!isEditingProfile ? (
                  <div className="profile-display-card">
                    <div className="profile-meta-grid">
                      <div className="profile-meta-item">
                        <small>FULL NAME</small>
                        <strong className="meta-val">{user.name}</strong>
                      </div>
                      <div className="profile-meta-item">
                        <small>PHONE NUMBER</small>
                        <strong className="meta-val">{user.phone}</strong>
                      </div>
                      <div className="profile-meta-item">
                        <small>EMAIL ADDRESS</small>
                        <strong className="meta-val">{user.email}</strong>
                      </div>
                      <div className="profile-meta-item">
                        <small>DEFAULT SUB-CITY</small>
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
                        <Edit2 size={15} /> Edit Cyclist Profile
                      </button>
                      <button
                        className="button button-outline"
                        onClick={() => {
                          onClose()
                          onOpenWishlist()
                        }}
                      >
                        <Heart size={15} /> Saved Wishlist ({wishlistCount})
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="crud-edit-box">
                    <h3>Edit Cyclist Profile</h3>

                    {profileUpdateError && (
                      <div className="text-red-600 text-xs py-2.5 px-3 bg-red-50 rounded-xl border border-red-200 mb-3 flex items-center gap-2">
                        <AlertCircle size={15} className="flex-shrink-0 text-red-500" />
                        <span className="font-semibold leading-tight">{profileUpdateError}</span>
                      </div>
                    )}

                    <div className="crud-form">
                      <label>
                        <span>Full Name</span>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      </label>
                      <label>
                        <span>Phone Number</span>
                        <input
                          type="tel"
                          required
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          placeholder="091 123 4567 or +251 91 123 4567"
                        />
                      </label>
                      <label>
                        <span>Addis Ababa Sub-city</span>
                        <select value={editSubcity} onChange={(e) => setEditSubcity(e.target.value)}>
                          <option value="Bole, Addis Ababa">Bole, Addis Ababa</option>
                          <option value="Addis Ababa Central">Addis Ababa Central</option>
                          <option value="Kazanchis">Kazanchis</option>
                          <option value="Kirkos">Kirkos</option>
                          <option value="Yeka / CMC">Yeka / CMC</option>
                          <option value="Lideta">Lideta</option>
                          <option value="Nifas Silk">Nifas Silk</option>
                          <option value="Arada">Arada</option>
                        </select>
                      </label>
                      <div className="btn-group">
                        <button
                          className="button button-dark disabled:opacity-50"
                          disabled={isSavingProfile}
                          onClick={handleSaveProfile}
                        >
                          <Check size={16} /> {isSavingProfile ? 'Verifying & Saving...' : 'Save Changes'}
                        </button>
                        <button
                          className="button button-ghost"
                          onClick={() => {
                            setIsEditingProfile(false)
                            setProfileUpdateError('')
                          }}
                        >
                          Cancel
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
                    <h3>Saved Delivery Locations</h3>
                    <p>Where our express dispatch vehicles will deliver your assembled bicycles.</p>
                  </div>
                  {!isAddingAddress && !editingAddressId && (
                    <button
                      className="button button-dark"
                      onClick={() => {
                        setIsAddingAddress(true)
                        setAddrLabel('Home')
                        setAddrRecipient(user.name)
                        setAddrPhone(user.phone)
                        setAddrSubcity('Addis Ababa')
                        setAddrStreet('')
                        setAddrLandmark('')
                      }}
                    >
                      <Plus size={16} /> Add New Address
                    </button>
                  )}
                </div>

                {/* Form to Add or Edit an Address */}
                {(isAddingAddress || editingAddressId) && (
                  <form onSubmit={handleSaveAddress} className="crud-form address-form-box">
                    <h4>{editingAddressId ? 'Edit Address' : 'Add New Delivery Address'}</h4>
                    <label>
                      Address Label
                      <input
                        type="text"
                        required
                        value={addrLabel}
                        onChange={(e) => setAddrLabel(e.target.value)}
                        placeholder="e.g. Home, Work, Studio"
                      />
                    </label>
                    <label>
                      Recipient Name
                      <input
                        type="text"
                        required
                        value={addrRecipient}
                        onChange={(e) => setAddrRecipient(e.target.value)}
                        placeholder="e.g. Dawit Haile"
                      />
                    </label>
                    <label>
                      Phone Number
                      <input
                        type="tel"
                        required
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        placeholder="+251 91 123 4567"
                      />
                    </label>
                    <label>
                      Addis Ababa Sub-city
                      <select value={addrSubcity} onChange={(e) => setAddrSubcity(e.target.value)}>
                        <option value="Addis Ababa">Addis Ababa Central</option>
                        <option value="Kazanchis">Kazanchis</option>
                        <option value="Kirkos">Kirkos</option>
                        <option value="Yeka">Yeka / CMC</option>
                        <option value="Lideta">Lideta</option>
                        <option value="Nifas Silk">Nifas Silk</option>
                      </select>
                    </label>
                    <label>
                      Street & House / Building
                      <input
                        type="text"
                        required
                        value={addrStreet}
                        onChange={(e) => setAddrStreet(e.target.value)}
                        placeholder="e.g. Namibia St, Near Medhanialem"
                      />
                    </label>
                    <label>
                      Landmark (Optional)
                      <input
                        type="text"
                        value={addrLandmark}
                        onChange={(e) => setAddrLandmark(e.target.value)}
                        placeholder="e.g. Behind Edna Mall, 2nd gate"
                      />
                    </label>
                    <div className="btn-group">
                      <button type="submit" className="button button-dark">
                        <Check size={16} /> Save Address
                      </button>
                      <button
                        type="button"
                        className="button button-ghost"
                        onClick={() => {
                          setIsAddingAddress(false)
                          setEditingAddressId(null)
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* List of Saved Addresses */}
                <div className="address-cards-grid">
                  {user.addresses.map((addr) => (
                    <div key={addr.id} className={`address-card ${addr.isDefault ? 'is-default' : ''}`}>
                      <div className="address-card-header">
                        <strong>{addr.label}</strong>
                        {addr.isDefault && <span className="default-pill">Default</span>}
                      </div>
                      <p className="addr-recipient"><strong>{addr.recipient}</strong> · {addr.phone}</p>
                      <p className="addr-location">{addr.street}, {addr.subcity}</p>
                      {addr.landmark && <p className="addr-landmark">Landmark: {addr.landmark}</p>}
                      <div className="address-card-actions">
                        {!addr.isDefault && (
                          <button
                            type="button"
                            className="text-link"
                            onClick={() => handleSetDefaultAddress(addr.id)}
                          >
                            Set as default
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
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        {user.addresses.length > 1 && (
                          <button
                            type="button"
                            className="icon-link text-danger"
                            onClick={() => handleDeleteAddress(addr.id)}
                            title="Delete"
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
                <h3>My Bicycle & Gear Orders</h3>
                {orders.length === 0 ? (
                  <p className="empty-notice">You have no active orders. Discover our collection to place your first order!</p>
                ) : (
                  <div className="orders-list">
                    {orders.map((ord) => (
                      <div key={ord.id} className="order-history-card">
                        <div className="order-card-header">
                          <div>
                            <strong>Order #{ord.id}</strong>
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
                            <small>TOTAL AMOUNT</small>
                            <strong className="order-total-price">ETB {ord.total.toLocaleString()}</strong>
                          </div>
                          <button
                            className="button button-dark"
                            onClick={() => {
                              onClose()
                              onTrackOrder(ord.id)
                            }}
                          >
                            <Package size={15} /> Track Live Progress
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
  )
}
