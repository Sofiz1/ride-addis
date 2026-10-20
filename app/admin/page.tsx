'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Package,
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  Check,
  CheckCircle2,
  Clock,
  Truck,
  ArrowLeft,
  ArrowRight,
  DollarSign,
  AlertCircle,
  FileText,
  ShieldCheck,
  LogOut,
  Layers,
  Star,
  Activity,
  Upload,
  Image as ImageIcon,
  X,
  Menu,
  Users,
  Phone,
  Mail,
  Search,
  MapPin,
  Ruler,
  Save
} from 'lucide-react'
import {
  Order,
  AdminSettings,
  loadOrdersFromStorage,
  saveOrdersToStorage,
  loadAdminSettings,
  saveAdminSettings,
  loadCustomProducts,
  saveCustomProducts,
  CategoryItem,
  loadCategories,
  saveCategories,
  EthiopianReview,
  loadReviews,
  saveReviews,
  UserProfile
} from '@/lib/store'
import { Product, ProductSizeOption } from '@/lib/catalog'

export default function AdminDashboardPage() {
  // Authentication State - persistent across refresh with zero logout flicker
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        sessionStorage.getItem('ride_addis_admin_auth') === 'true' ||
        localStorage.getItem('ride_addis_admin_auth') === 'true'
      )
    }
    return false
  })
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true)
  const [adminEmailInput, setAdminEmailInput] = useState('')
  const [adminPasswordInput, setAdminPasswordInput] = useState('')
  const [loginError, setLoginError] = useState('')

  // Navigation Tabs with refresh persistence
  type AdminTabType =
    | 'analytics'
    | 'orders'
    | 'products'
    | 'categories'
    | 'reviews'
    | 'payments'
    | 'content'
    | 'users'

  const [activeTab, setActiveTabState] = useState<AdminTabType>(() => {
    if (typeof window !== 'undefined') {
      try {
        const hash = window.location.hash.replace('#', '') as AdminTabType
        if (hash && ['analytics', 'orders', 'products', 'categories', 'reviews', 'payments', 'content', 'users'].includes(hash)) {
          return hash
        }
        const saved = localStorage.getItem('ride_addis_admin_active_tab') as AdminTabType
        if (
          saved &&
          ['analytics', 'orders', 'products', 'categories', 'reviews', 'payments', 'content', 'users'].includes(saved)
        ) {
          return saved
        }
      } catch {}
    }
    return 'orders'
  })

  // Guarantee hydration and browser refresh persistence for current tab
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const validTabs: AdminTabType[] = [
        'analytics',
        'orders',
        'products',
        'categories',
        'reviews',
        'payments',
        'content',
        'users'
      ]
      const hash = window.location.hash.replace('#', '') as AdminTabType
      if (hash && validTabs.includes(hash)) {
        setActiveTabState(hash)
        localStorage.setItem('ride_addis_admin_active_tab', hash)
        return
      }
      const saved = localStorage.getItem('ride_addis_admin_active_tab') as AdminTabType
      if (saved && validTabs.includes(saved)) {
        setActiveTabState(saved)
        window.location.hash = saved
      }
    } catch {}
  }, [])

  const setActiveTab = (tab: AdminTabType) => {
    setActiveTabState(tab)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ride_addis_admin_active_tab', tab)
        window.location.hash = tab
      } catch {}
    }
  }

  // Registered Cyclists State (Database-backed)
  interface RegisteredUserRecord extends UserProfile {
    ordersCount?: number
    totalSpent?: number
    lastOrderDate?: string | null
  }
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUserRecord[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(false)
  const [userSearchTerm, setUserSearchTerm] = useState<string>('')

  // Mobile Menu State for Dashboard
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  // Real-time tracking data
  const [activeVisitors, setActiveVisitors] = useState(1)
  const [todayViews, setTodayViews] = useState(0)

  // Orders State
  const [orders, setOrders] = useState<Order[]>([])
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null)
  const [decliningOrderId, setDecliningOrderId] = useState<string | null>(null)
  const [declineReasonInput, setDeclineReasonInput] = useState('Transaction reference not found in Telebirr statement')

  // Order Edit Fields
  const [editCourierName, setEditCourierName] = useState('')
  const [editCourierPhone, setEditCourierPhone] = useState('')
  const [editEta, setEditEta] = useState('')
  const [editPaymentStatus, setEditPaymentStatus] = useState<Order['paymentStatus']>('paid')
  const [editStep, setEditStep] = useState<number>(1)
  const [editStatus, setEditStatus] = useState<Order['status']>('confirmed')

  // Payment & CMS Settings State
  const [settings, setSettings] = useState<AdminSettings>(loadAdminSettings())
  const [toastMsg, setToastMsg] = useState('')

  // Products State
  const [products, setProducts] = useState<Product[]>([])
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)

  // Product Form Fields
  const [pName, setPName] = useState('')
  const [pNameAm, setPNameAm] = useState('')
  const [pCategory, setPCategory] = useState('City bikes')
  const [pBrand, setPBrand] = useState('Ride Addis')
  const [pPrice, setPPrice] = useState(75000)
  const [pImages, setPImages] = useState<string[]>(['/hero-bike.png'])
  const pImage = pImages[0] || '/hero-bike.png'
  const [pDescription, setPDescription] = useState('')
  const [pDescriptionAm, setPDescriptionAm] = useState('')

  // Engineering Specifications & Build Details
  const [pFrame, setPFrame] = useState('6061 Hydroformed Alloy')
  const [pWeight, setPWeight] = useState('12.2 kg')
  const [pGears, setPGears] = useState('Shimano 7-Speed')
  const [pBrakes, setPBrakes] = useState('Hydraulic Disc Brakes')
  const [pWheels, setPWheels] = useState('700c Double-Wall Aero Rims')
  const [pRecommendedHeight, setPRecommendedHeight] = useState('160 - 185 cm')
  const [pWarranty, setPWarranty] = useState('2 Years Ride Addis Guarantee')

  // Adult Bike Sizes & cm configuration
  const [pHasSmall, setPHasSmall] = useState(true)
  const [pPriceSmall, setPPriceSmall] = useState(72000)
  const [pAdultSmallCm, setPAdultSmallCm] = useState('155 - 170 cm')

  const [pHasMedium, setPHasMedium] = useState(true)
  const [pPriceMedium, setPPriceMedium] = useState(75000)
  const [pAdultMediumCm, setPAdultMediumCm] = useState('168 - 182 cm')

  const [pHasLarge, setPHasLarge] = useState(true)
  const [pPriceLarge, setPPriceLarge] = useState(78000)
  const [pAdultLargeCm, setPAdultLargeCm] = useState('180 - 195 cm')

  const [pHasXLarge, setPHasXLarge] = useState(false)
  const [pPriceXLarge, setPPriceXLarge] = useState(82000)
  const [pAdultXLargeCm, setPAdultXLargeCm] = useState('188 - 202 cm')

  // Kids Bike Sizes & cm configuration
  interface KidsSizeConfig {
    id: string
    label: string
    heightCm: string
    ageGroup: string
    enabled: boolean
    price: number
  }

  const DEFAULT_KIDS_SIZES: KidsSizeConfig[] = [
    { id: 'k12', label: '12" Wheel', heightCm: '76 - 96 cm', ageGroup: 'Ages 2 - 3', enabled: true, price: 38000 },
    { id: 'k14', label: '14" Wheel', heightCm: '91 - 101 cm', ageGroup: 'Ages 3 - 4', enabled: true, price: 42000 },
    { id: 'k16', label: '16" Wheel', heightCm: '101 - 122 cm', ageGroup: 'Ages 4 - 7', enabled: true, price: 46000 },
    { id: 'k20', label: '20" Wheel', heightCm: '106 - 132 cm', ageGroup: 'Ages 5 - 9', enabled: false, price: 52000 },
    { id: 'k24', label: '24" Wheel', heightCm: '122 - 152 cm', ageGroup: 'Ages 7 - 13', enabled: false, price: 58000 }
  ]
  const [pKidsSizes, setPKidsSizes] = useState<KidsSizeConfig[]>(DEFAULT_KIDS_SIZES)

  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Categories CRUD State
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [cName, setCName] = useState('')
  const [cNameAm, setCNameAm] = useState('')
  const [cDescription, setCDescription] = useState('')

  // Reviews CRUD State
  const [reviews, setReviews] = useState<EthiopianReview[]>([])
  const [isAddingReview, setIsAddingReview] = useState(false)
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [rAuthor, setRAuthor] = useState('')
  const [rLocation, setRLocation] = useState('Bole, Addis Ababa')
  const [rBikeModel, setRBikeModel] = useState('Addis Commuter 01')
  const [rRating, setRRating] = useState(5)
  const [rTextEn, setRTextEn] = useState('')
  const [rTextAm, setRTextAm] = useState('')

  // Live server orders sync
  const fetchLiveOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      if (res.ok) {
        const json = await res.json()
        if (json.success && Array.isArray(json.data)) {
          setOrders(json.data)
          saveOrdersToStorage(json.data)
        }
      }
    } catch (e) {
      console.error('Error fetching live orders:', e)
    }
  }

  // Initialize data on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuth =
        sessionStorage.getItem('ride_addis_admin_auth') === 'true' ||
        localStorage.getItem('ride_addis_admin_auth') === 'true'
      setIsAdminAuthenticated(isAuth)
    }
    setIsAuthChecking(false)
    setOrders(loadOrdersFromStorage())
    setSettings(loadAdminSettings())
    fetch('/api/settings')
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          setSettings(json.data)
          saveAdminSettings(json.data)
        }
      })
      .catch(() => {})
    setProducts(loadCustomProducts())
    setCategories(loadCategories())
    setReviews(loadReviews())
  }, [])

  useEffect(() => {
    if (!isAdminAuthenticated) return
    fetchLiveOrders()
    loadRegisteredUsers()
    const interval = setInterval(() => {
      fetchLiveOrders()
      loadRegisteredUsers()
    }, 8000)
    return () => clearInterval(interval)
  }, [isAdminAuthenticated])

  // Sync across tabs & real-time events (DO NOT sync on focus to prevent wiping user input)
  useEffect(() => {
    const handleSync = () => {
      fetchLiveOrders()
      loadRegisteredUsers()
      setProducts(loadCustomProducts())
      setCategories(loadCategories())
      setReviews(loadReviews())
    }
    window.addEventListener('storage', handleSync)
    window.addEventListener('order-updated', handleSync)
    return () => {
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('order-updated', handleSync)
    }
  }, [])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 4000)
  }

  // Functional Save handler for Payment Gateways and Storefront CMS
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsSavingSettings(true)
    try {
      saveAdminSettings(settings)
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      if (res.ok) {
        const json = await res.json()
        if (json.success && json.data) {
          setSettings(json.data)
          saveAdminSettings(json.data)
        }
      }
      showToast('Settings saved successfully & live storefront updated!')
    } catch (err) {
      console.error('Save settings error:', err)
      showToast('Settings saved to local storage!')
    } finally {
      setIsSavingSettings(false)
    }
  }

  // Admin Login Handler (Server-side API authenticated, credentials from .env)
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'admin-login',
          email: adminEmailInput.trim(),
          password: adminPasswordInput.trim()
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setIsAdminAuthenticated(true)
        sessionStorage.setItem('ride_addis_admin_auth', 'true')
        localStorage.setItem('ride_addis_admin_auth', 'true')
        setLoginError('')
        showToast('Welcome back, Administrator!')
      } else {
        setLoginError(data.error || 'Invalid administrator email or password.')
      }
    } catch {
      setLoginError('Authentication service is currently unavailable. Please try again.')
    }
  }

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false)
    sessionStorage.removeItem('ride_addis_admin_auth')
    localStorage.removeItem('ride_addis_admin_auth')
    showToast('Signed out from Administrator Control Center.')
  }

  // Load Registered Users from live database
  const loadRegisteredUsers = async () => {
    setIsLoadingUsers(true)
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        if (data.success && Array.isArray(data.users)) {
          setRegisteredUsers(data.users)
        }
      }
    } catch (err) {
      console.error('Failed to load registered users', err)
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete cyclist account "${name}"? This will remove their record from database.`)) {
      return
    }
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setRegisteredUsers(prev => prev.filter(u => u.id !== id))
        showToast(`Cyclist "${name}" was removed from database.`)
      } else {
        showToast('Failed to delete user.')
      }
    } catch (err) {
      showToast('Error communicating with database.')
    }
  }

  // Real Image Upload (Supports up to 3 photos per item)
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validNonPlaceholder = pImages.filter(img => img && img !== '/hero-bike.png')
    if (validNonPlaceholder.length >= 3) {
      showToast('Maximum 3 photos reached. Please remove one photo first.')
      if (e.target) e.target.value = ''
      return
    }

    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        if (data.success && data.url) {
          setPImages(prev => {
            const filtered = prev.filter(img => img && img !== '/hero-bike.png')
            return [...filtered, data.url].slice(0, 3)
          })
          showToast(`Photo added (${Math.min(3, validNonPlaceholder.length + 1)}/3): ${data.fileName}`)
          setIsUploadingImage(false)
          if (e.target) e.target.value = ''
          return
        }
      }
    } catch (err) {
      console.warn('API upload fallback to local data URL', err)
    }

    const reader = new FileReader()
    reader.onload = event => {
      if (event.target?.result) {
        const dataUrl = event.target.result as string
        setPImages(prev => {
          const filtered = prev.filter(img => img && img !== '/hero-bike.png')
          return [...filtered, dataUrl].slice(0, 3)
        })
        showToast(`Photo loaded from device (${Math.min(3, validNonPlaceholder.length + 1)}/3)!`)
      }
      setIsUploadingImage(false)
      if (e.target) e.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  // Remove a photo from item and optionally delete file on server disk
  const handleRemoveProductImage = async (indexToRemove: number) => {
    const targetUrl = pImages[indexToRemove]

    // If it's a persistent file on disk in /uploads/, delete via /api/upload
    if (targetUrl && targetUrl.startsWith('/uploads/')) {
      try {
        await fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: targetUrl })
        })
      } catch (err) {
        console.warn('Could not delete file from disk:', err)
      }
    }

    setPImages(prev => {
      const next = prev.filter((_, idx) => idx !== indexToRemove)
      return next.length > 0 ? next : ['/hero-bike.png']
    })
    showToast('Photo removed from item.')
  }

  // Order Actions
  const handleApprovePayment = async (orderId: string) => {
    const updated = orders.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          paymentStatus: 'paid' as const,
          status: 'approved' as const,
          statusStep: 1,
          eta: 'Today within 2-3 hours',
          declineReason: undefined
        }
      }
      return ord
    })
    setOrders(updated)
    saveOrdersToStorage(updated)
    try {
      await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          paymentStatus: 'paid',
          status: 'approved',
          statusStep: 1,
          eta: 'Today within 2-3 hours',
          declineReason: null
        })
      })
    } catch (e) {
      console.error(e)
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('order-updated'))
      window.dispatchEvent(new Event('storage'))
    }
    showToast(`Order #${orderId} payment APPROVED! Customer tracker updated.`)
  }

  const handleConfirmDecline = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!decliningOrderId) return
    const orderId = decliningOrderId
    const reason = declineReasonInput.trim() || 'Payment reference could not be verified in official bank statement.'

    const updated = orders.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          paymentStatus: 'declined' as const,
          status: 'declined' as const,
          declineReason: reason
        }
      }
      return ord
    })
    setOrders(updated)
    saveOrdersToStorage(updated)
    setDecliningOrderId(null)

    try {
      await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          paymentStatus: 'declined',
          status: 'declined',
          declineReason: reason
        })
      })
    } catch (e) {
      console.error(e)
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('order-updated'))
      window.dispatchEvent(new Event('storage'))
    }
    showToast(`Order #${orderId} DECLINED. Customer will see reason: "${reason}"`)
  }

  const handleSetOnTheWay = async (orderId: string) => {
    const updated = orders.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          status: 'on_the_way' as const,
          statusStep: 2,
          eta: 'En route · Arriving in 45-60 mins',
          courierName: ord.courierName || 'Addis Courier Fleet #4',
          courierPhone: ord.courierPhone || '+251 91 198 7654'
        }
      }
      return ord
    })
    setOrders(updated)
    saveOrdersToStorage(updated)
    try {
      await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          status: 'on_the_way',
          statusStep: 2,
          eta: 'En route · Arriving in 45-60 mins'
        })
      })
    } catch (e) {
      console.error(e)
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('order-updated'))
      window.dispatchEvent(new Event('storage'))
    }
    showToast(`Order #${orderId} marked ON THE WAY!`)
  }

  const handleSetDelivered = async (orderId: string) => {
    const updated = orders.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          status: 'delivered' as const,
          statusStep: 3,
          eta: 'Delivered and Handed Over'
        }
      }
      return ord
    })
    setOrders(updated)
    saveOrdersToStorage(updated)
    try {
      await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: orderId,
          status: 'delivered',
          statusStep: 3,
          eta: 'Delivered and Handed Over'
        })
      })
    } catch (e) {
      console.error(e)
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('order-updated'))
      window.dispatchEvent(new Event('storage'))
    }
    showToast(`Order #${orderId} marked DELIVERED!`)
  }

  const handleSaveOrderDispatch = (orderId: string) => {
    const updated = orders.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          status: editStatus,
          statusStep: editStep,
          paymentStatus: editPaymentStatus,
          courierName: editCourierName || ord.courierName,
          courierPhone: editCourierPhone || ord.courierPhone,
          eta: editEta || ord.eta
        }
      }
      return ord
    })
    setOrders(updated)
    saveOrdersToStorage(updated)
    setEditingOrderId(null)
    showToast(`Order #${orderId} dispatch updated!`)
  }

  const executeDeleteOrder = (orderId: string) => {
    const updated = orders.filter(o => o.id.toLowerCase() !== orderId.toLowerCase())
    setOrders(updated)
    saveOrdersToStorage(updated)
    showToast(`Order #${orderId} deleted.`)
  }

  // Product Actions
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault()

    // Build sizes array from admin configuration (supporting assigned cm for kids & adults)
    const isKids = pCategory.toLowerCase().includes('kids')
    const configuredSizes: ProductSizeOption[] = []

    if (isKids) {
      pKidsSizes.forEach(ks => {
        if (ks.enabled) {
          configuredSizes.push({
            size: ks.label,
            heightCm: ks.heightCm,
            price: Number(ks.price) || Number(pPrice)
          })
        }
      })
    } else {
      if (pHasSmall) {
        configuredSizes.push({
          size: 'Small',
          heightCm: pAdultSmallCm.trim() || '155 - 170 cm',
          price: Number(pPriceSmall) || Number(pPrice)
        })
      }
      if (pHasMedium) {
        configuredSizes.push({
          size: 'Medium',
          heightCm: pAdultMediumCm.trim() || '168 - 182 cm',
          price: Number(pPriceMedium) || Number(pPrice)
        })
      }
      if (pHasLarge) {
        configuredSizes.push({
          size: 'Large',
          heightCm: pAdultLargeCm.trim() || '180 - 195 cm',
          price: Number(pPriceLarge) || Number(pPrice)
        })
      }
      if (pHasXLarge) {
        configuredSizes.push({
          size: 'XL',
          heightCm: pAdultXLargeCm.trim() || '188 - 202 cm',
          price: Number(pPriceXLarge) || Number(pPrice)
        })
      }
    }

    const effectiveBasePrice = configuredSizes.length > 0 ? configuredSizes[0].price : Number(pPrice)
    const compiledSpecs = {
      frame: pFrame.trim() || '6061 Hydroformed Alloy',
      gears: pGears.trim() || 'Shimano 7-Speed',
      brakes: pBrakes.trim() || 'Hydraulic Disc Brakes',
      weight: pWeight.trim() || '12.2 kg',
      wheels: pWheels.trim() || '700c Double-Wall Aero Rims',
      recommendedHeight: pRecommendedHeight.trim() || (isKids ? '115 - 135 cm' : '160 - 185 cm'),
      warranty: pWarranty.trim() || '2 Years Ride Addis Guarantee'
    }

    if (editingProductId) {
      let updatedProductObj: Product | null = null
      const updated = products.map(p => {
        if (p.id === editingProductId) {
          updatedProductObj = {
            ...p,
            name: pName,
            am: pNameAm || pName,
            category: pCategory,
            brand: pBrand,
            price: effectiveBasePrice,
            priceFormatted: `ETB ${effectiveBasePrice.toLocaleString()}`,
            images: pImages.length > 0 ? pImages : ['/hero-bike.png'],
            description: pDescription,
            amDescription: pDescriptionAm || pDescription,
            sizes: configuredSizes.length > 0 ? configuredSizes : undefined,
            specs: compiledSpecs
          }
          return updatedProductObj
        }
        return p
      })
      setProducts(updated)
      saveCustomProducts(updated)
      setEditingProductId(null)

      // Persist to database API
      if (updatedProductObj) {
        fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedProductObj)
        }).catch(err => console.warn('Could not sync PUT to /api/products:', err))
      }

      showToast('Product updated successfully with Engineering Specs & Sizing!')
    } else {
      const newProduct: Product = {
        id: 'custom-' + Date.now(),
        name: pName,
        am: pNameAm || pName,
        category: pCategory,
        section: pCategory.toLowerCase().includes('bike') ? 'bike' : 'accessory',
        brand: pBrand,
        type: `${pCategory} / Performance`,
        price: effectiveBasePrice,
        priceFormatted: `ETB ${effectiveBasePrice.toLocaleString()}`,
        description: pDescription,
        amDescription: pDescriptionAm || pDescription,
        images: pImages.length > 0 ? pImages : ['/hero-bike.png'],
        tone: '#252925',
        sizes: configuredSizes.length > 0 ? configuredSizes : undefined,
        specs: compiledSpecs
      }
      const updated = [newProduct, ...products]
      setProducts(updated)
      saveCustomProducts(updated)
      setIsAddingProduct(false)

      // Persist to database API
      fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      }).catch(err => console.warn('Could not sync POST to /api/products:', err))

      showToast('New product added with Engineering Specs & Custom Sizing!')
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'))
    }

    setPName('')
    setPNameAm('')
    setPDescription('')
    setPDescriptionAm('')
  }

  const executeDeleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id)
    setProducts(updated)
    saveCustomProducts(updated)
    fetch(`/api/products?id=${id}`, { method: 'DELETE' }).catch(err =>
      console.warn('Could not sync DELETE to /api/products:', err)
    )
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'))
    }
    showToast('Product removed from catalog.')
  }

  const handleStartEditProduct = (p: Product) => {
    setEditingProductId(p.id)
    setIsAddingProduct(false)
    setPName(p.name)
    setPNameAm(p.am || p.name)
    setPCategory(p.category)
    setPBrand(p.brand)
    setPPrice(p.price)
    setPImages(p.images && p.images.length > 0 ? [...p.images].slice(0, 3) : ['/hero-bike.png'])
    setPDescription(p.description || '')
    setPDescriptionAm(p.amDescription || '')

    const isKids = (p.category || '').toLowerCase().includes('kids')
    setPFrame(p.specs?.frame || (isKids ? 'High-Tensile Steel' : '6061 Hydroformed Alloy'))
    setPGears(p.specs?.gears || (isKids ? 'Single Speed' : 'Shimano 7-Speed'))
    setPBrakes(p.specs?.brakes || (isKids ? 'Linear-Pull V-Brakes' : 'Hydraulic Disc Brakes'))
    setPWeight(p.specs?.weight || (isKids ? '8.8 kg' : '12.2 kg'))
    setPWheels(p.specs?.wheels || (isKids ? '16" Lightweight Alloy' : '700c Double-Wall Aero Rims'))
    setPRecommendedHeight(p.specs?.recommendedHeight || (isKids ? '115 - 135 cm' : '160 - 185 cm'))
    setPWarranty(p.specs?.warranty || '2 Years Ride Addis Guarantee')

    if (isKids) {
      if (p.sizes && p.sizes.length > 0) {
        setPKidsSizes(DEFAULT_KIDS_SIZES.map(ks => {
          const matched = p.sizes?.find(s => s.size.toLowerCase().includes(ks.label.toLowerCase()) || ks.label.toLowerCase().includes(s.size.toLowerCase()))
          if (matched) {
            return { ...ks, enabled: true, price: matched.price, heightCm: matched.heightCm || ks.heightCm }
          }
          return { ...ks, enabled: false }
        }))
      } else {
        setPKidsSizes(DEFAULT_KIDS_SIZES.map(ks => ({ ...ks, price: p.price })))
      }
    } else {
      const sOpt = p.sizes?.find(s => s.size.toLowerCase() === 'small')
      const mOpt = p.sizes?.find(s => s.size.toLowerCase() === 'medium')
      const lOpt = p.sizes?.find(s => s.size.toLowerCase() === 'large')
      const xlOpt = p.sizes?.find(s => s.size.toLowerCase() === 'xl' || s.size.toLowerCase() === 'extra large')

      if (p.sizes && p.sizes.length > 0) {
        setPHasSmall(!!sOpt)
        setPPriceSmall(sOpt ? sOpt.price : Math.max(0, p.price - 3000))
        setPAdultSmallCm(sOpt?.heightCm || '155 - 170 cm')

        setPHasMedium(!!mOpt)
        setPPriceMedium(mOpt ? mOpt.price : p.price)
        setPAdultMediumCm(mOpt?.heightCm || '168 - 182 cm')

        setPHasLarge(!!lOpt)
        setPPriceLarge(lOpt ? lOpt.price : p.price + 3000)
        setPAdultLargeCm(lOpt?.heightCm || '180 - 195 cm')

        setPHasXLarge(!!xlOpt)
        setPPriceXLarge(xlOpt ? xlOpt.price : p.price + 6000)
        setPAdultXLargeCm(xlOpt?.heightCm || '188 - 202 cm')
      } else {
        setPHasSmall(true)
        setPPriceSmall(Math.max(0, p.price - 3000))
        setPAdultSmallCm('155 - 170 cm')
        setPHasMedium(true)
        setPPriceMedium(p.price)
        setPAdultMediumCm('168 - 182 cm')
        setPHasLarge(true)
        setPPriceLarge(p.price + 3000)
        setPAdultLargeCm('180 - 195 cm')
        setPHasXLarge(false)
        setPPriceXLarge(p.price + 6000)
        setPAdultXLargeCm('188 - 202 cm')
      }
    }
  }

  // Categories CRUD
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!cName.trim()) return

    const slug = cName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    if (editingCategoryId) {
      const updated = categories.map(cat =>
        cat.id === editingCategoryId
          ? {
              ...cat,
              name: cName.trim(),
              nameAm: cNameAm.trim() || cName.trim(),
              description: cDescription.trim(),
              slug
            }
          : cat
      )
      setCategories(updated)
      saveCategories(updated)
      setEditingCategoryId(null)
      showToast('Category updated successfully!')
    } else {
      const newCat: CategoryItem = {
        id: 'cat-' + Date.now(),
        name: cName.trim(),
        nameAm: cNameAm.trim() || cName.trim(),
        slug,
        description: cDescription.trim(),
        itemCount: 0,
        isActive: true
      }
      const updated = [...categories, newCat]
      setCategories(updated)
      saveCategories(updated)
      setIsAddingCategory(false)
      showToast(`Category "${newCat.name}" added to storefront!`)
    }
    setCName('')
    setCNameAm('')
    setCDescription('')
  }

  const handleDeleteCategory = (catId: string) => {
    const cat = categories.find(c => c.id === catId)
    if (cat?.name === 'All') {
      alert('The "All" category is required.')
      return
    }
    const updated = categories.filter(c => c.id !== catId)
    setCategories(updated)
    saveCategories(updated)
    showToast('Category deleted.')
  }

  // Reviews CRUD
  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rAuthor.trim() || !rTextEn.trim()) return

    if (editingReviewId) {
      const updated = reviews.map(rev =>
        rev.id === editingReviewId
          ? {
              ...rev,
              authorName: rAuthor.trim(),
              authorLocation: rLocation.trim(),
              bikeModel: rBikeModel.trim(),
              rating: rRating,
              reviewEn: rTextEn.trim(),
              reviewAm: rTextAm.trim() || rTextEn.trim()
            }
          : rev
      )
      setReviews(updated)
      saveReviews(updated)
      setEditingReviewId(null)
      showToast('Customer review updated!')
    } else {
      const newRev: EthiopianReview = {
        id: 'rev-' + Date.now(),
        authorName: rAuthor.trim(),
        authorLocation: rLocation.trim(),
        authorAvatar: '',
        bikeModel: rBikeModel.trim(),
        rating: rRating,
        date: 'Today',
        verified: true,
        isLocalGuide: true,
        reviewEn: rTextEn.trim(),
        reviewAm: rTextAm.trim() || rTextEn.trim(),
        helpfulCount: 5,
        isFeatured: true
      }
      const updated = [newRev, ...reviews]
      setReviews(updated)
      saveReviews(updated)
      setIsAddingReview(false)
      showToast('New review published to storefront!')
    }
    setRAuthor('')
    setRTextEn('')
    setRTextAm('')
  }

  const handleDeleteReview = (revId: string) => {
    const updated = reviews.filter(r => r.id !== revId)
    setReviews(updated)
    saveReviews(updated)
    showToast('Review removed.')
  }

  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + (o.total || 0), 0)

  // Smooth loading state during initial frame check (prevents any login flicker on refresh)
  if (isAuthChecking && !isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070b13] flex items-center justify-center p-4 text-slate-400">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 42 42" width={32} height={32} className="text-amber-400 animate-spin">
            <path d="M21 3 38 13v16L21 39 4 29V13L21 3Z" fill="none" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <span className="text-xs uppercase tracking-widest font-mono text-slate-400">Loading Control Center...</span>
        </div>
      </div>
    )
  }

  // ================= 1. LOGIN SCREEN WITH SITE LOGO =================
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070b13] flex items-center justify-center p-4 text-white font-sans antialiased">
        <div className="bg-[#0f172a] border border-slate-700/80 rounded-3xl p-6 sm:p-10 max-w-md w-full shadow-2xl relative">
          
          {/* Official Ride Addis Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <svg viewBox="0 0 42 42" aria-hidden="true" width={44} height={44} className="text-amber-400 flex-shrink-0">
                <path d="M21 3 38 13v16L21 39 4 29V13L21 3Z" fill="none" stroke="currentColor" strokeWidth="1.7"/>
                <path d="m11 24 6-10 3 6 4-7 7 11h-5l-3-5-3 5h-4l-2 3h-3Z" fill="currentColor"/>
              </svg>
              <div className="text-left">
                <span className="text-white text-2xl tracking-[0.16em] leading-none block" style={{ fontFamily: 'Georgia, serif' }}>
                  <strong className="font-bold">RIDE</strong><small className="text-xs tracking-[0.26em] text-amber-400 ml-1.5 font-sans font-black">ADDIS</small>
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mt-1">Control Center</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Sign in to manage live orders, product inventory, and storefront settings.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            {loginError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Administrator Email
              </label>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                required
                value={adminEmailInput}
                onChange={e => setAdminEmailInput(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-3 text-white text-base sm:text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Security Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={adminPasswordInput}
                onChange={e => setAdminPasswordInput(e.target.value)}
                placeholder="Password"
                className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-3 text-white text-base sm:text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black py-3 px-4 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-lg"
            >
              Sign In to Control Center <ArrowRight size={16} />
            </button>

            <div className="text-center pt-4">
              <Link href="/" className="text-xs text-slate-400 hover:text-white transition inline-flex items-center gap-1.5">
                <ArrowLeft size={14} /> Return to Storefront
              </Link>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // ================= 2. RESPONSIVE DASHBOARD =================
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#070b13] text-slate-100 flex flex-col font-sans antialiased">
      
      {/* Top Bar with Official Site Logo */}
      <header className="bg-[#0f172a] border-b border-slate-800 sticky top-0 z-40 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between shadow-md w-full max-w-full overflow-hidden">
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            onClick={() => setIsMobileNavOpen(prev => !prev)}
            className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#1e293b] active:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm transition"
            aria-label="Toggle Pages Navigation"
          >
            {isMobileNavOpen ? <X size={18} className="text-amber-400" /> : <Menu size={18} className="text-amber-400" />}
            <span className="text-xs font-bold">Pages</span>
          </button>

          {/* Official Ride Addis Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <svg viewBox="0 0 42 42" aria-hidden="true" width={32} height={32} className="text-amber-400 group-hover:text-amber-300 transition flex-shrink-0">
              <path d="M21 3 38 13v16L21 39 4 29V13L21 3Z" fill="none" stroke="currentColor" strokeWidth="1.7"/>
              <path d="m11 24 6-10 3 6 4-7 7 11h-5l-3-5-3 5h-4l-2 3h-3Z" fill="currentColor"/>
            </svg>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-white text-base tracking-[0.16em] leading-none" style={{ fontFamily: 'Georgia, serif' }}>
                  <strong className="font-bold">RIDE</strong><small className="text-[9px] tracking-[0.26em] text-amber-400 ml-1 font-sans font-black">ADDIS</small>
                </span>
                {/* Active Page Indicator Pill on Mobile */}
                <span className="md:hidden text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 capitalize font-sans">
                  {activeTab === 'users' ? 'Cyclists' : activeTab === 'content' ? 'CMS' : activeTab}
                </span>
              </div>
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">Control Center</span>
            </div>
          </Link>
        </div>

        {toastMsg && (
          <div className="hidden lg:flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-4 py-1.5 rounded-full font-semibold">
            <CheckCircle2 size={15} />
            <span>{toastMsg}</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition"
          >
            <ArrowLeft size={13} /> View Store
          </Link>

          <button
            onClick={handleAdminLogout}
            className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Mobile Slide-Over Pages Menu Drawer (Opens when hamburger button is clicked) */}
      {isMobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileNavOpen(false)}
          />

          {/* Drawer Menu Panel */}
          <div className="relative w-[320px] max-w-[85vw] bg-[#0b1120] border-r border-slate-800 h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0f172a]">
              <div className="flex items-center gap-2.5">
                <svg viewBox="0 0 42 42" aria-hidden="true" width={28} height={28} className="text-amber-400 flex-shrink-0">
                  <path d="M21 3 38 13v16L21 39 4 29V13L21 3Z" fill="none" stroke="currentColor" strokeWidth="1.7"/>
                  <path d="m11 24 6-10 3 6 4-7 7 11h-5l-3-5-3 5h-4l-2 3h-3Z" fill="currentColor"/>
                </svg>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">Admin Pages</h3>
                  <p className="text-[10px] text-slate-400">Choose page to view</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileNavOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Pages List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {[
                { id: 'orders', label: 'Orders & Dispatch', icon: Package, count: orders.length, desc: 'Verification, Telebirr & couriers' },
                { id: 'products', label: 'Product Catalog', icon: Layers, count: products.length, desc: 'Bikes, 3-angle photos & prices' },
                { id: 'users', label: 'Registered Cyclists', icon: Users, count: registeredUsers.length, desc: 'Accounts, orders & coordinates' },
                { id: 'categories', label: 'Categories CRUD', icon: Layers, count: categories.length, desc: 'Storefront category tags' },
                { id: 'reviews', label: 'Google Reviews', icon: Star, count: reviews.length, desc: 'Verified customer feedback' },
                { id: 'analytics', label: 'Live Analytics', icon: Activity, desc: 'Revenue & subcity traffic' },
                { id: 'payments', label: 'Payment Gateways', icon: CreditCard, desc: 'Telebirr & CBE accounts' },
                { id: 'content', label: 'Storefront CMS', icon: FileText, desc: 'Live announcements & hero texts' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setIsMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition text-left ${
                    activeTab === item.id
                      ? 'bg-amber-500 text-neutral-950 shadow-lg'
                      : 'text-slate-200 hover:bg-[#1e293b] active:bg-[#1e293b]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${
                      activeTab === item.id ? 'bg-neutral-950/20 text-neutral-950' : 'bg-slate-800 text-amber-400'
                    }`}>
                      <item.icon size={17} />
                    </div>
                    <div>
                      <span className="block text-xs font-bold">{item.label}</span>
                      <span className={`block text-[10px] font-normal ${
                        activeTab === item.id ? 'text-neutral-900/80' : 'text-slate-400'
                      }`}>
                        {item.desc}
                      </span>
                    </div>
                  </div>
                  {item.count !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                      activeTab === item.id ? 'bg-neutral-950 text-amber-400' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Bottom Actions inside Drawer */}
            <div className="p-3 border-t border-slate-800/80 bg-[#0f172a] space-y-2">
              <Link
                href="/"
                onClick={() => setIsMobileNavOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-[#1e293b] text-slate-200 font-semibold py-2.5 px-4 rounded-xl text-xs border border-slate-700"
              >
                <ArrowLeft size={14} /> Back to Storefront
              </Link>
              <button
                onClick={() => {
                  setIsMobileNavOpen(false);
                  handleAdminLogout();
                }}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 font-semibold py-2.5 px-4 rounded-xl text-xs border border-red-500/30"
              >
                <LogOut size={14} /> Sign Out Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Responsive Navigation + Content */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto px-2.5 py-4 sm:p-6 lg:p-8 gap-4 sm:gap-6 min-w-0 overflow-x-hidden">

        {/* Desktop-Only Navigation Sidebar (hidden on mobile, permanent on PC) */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-2.5 shadow-xl space-y-1 sticky top-20">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'analytics'
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'text-slate-300 hover:bg-[#1e293b] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Activity size={16} />
                <span>Live Analytics</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'orders'
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'text-slate-300 hover:bg-[#1e293b] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package size={16} />
                <span>Orders & Dispatch</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${activeTab === 'orders' ? 'bg-neutral-950/20 text-neutral-950' : 'bg-slate-800 text-slate-300'}`}>
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'products'
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'text-slate-300 hover:bg-[#1e293b] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers size={16} />
                <span>Product Catalog</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${activeTab === 'products' ? 'bg-neutral-950/20 text-neutral-950' : 'bg-slate-800 text-slate-300'}`}>
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'users'
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'text-slate-300 hover:bg-[#1e293b] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users size={16} />
                <span>Registered Cyclists</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${activeTab === 'users' ? 'bg-neutral-950/20 text-neutral-950' : 'bg-slate-800 text-slate-300'}`}>
                {registeredUsers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'categories'
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'text-slate-300 hover:bg-[#1e293b] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers size={16} />
                <span>Categories CRUD</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${activeTab === 'categories' ? 'bg-neutral-950/20 text-neutral-950' : 'bg-slate-800 text-slate-300'}`}>
                {categories.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'reviews'
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'text-slate-300 hover:bg-[#1e293b] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Star size={16} />
                <span>Google Reviews</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${activeTab === 'reviews' ? 'bg-neutral-950/20 text-neutral-950' : 'bg-slate-800 text-slate-300'}`}>
                {reviews.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'payments'
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'text-slate-300 hover:bg-[#1e293b] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard size={16} />
                <span>Telebirr & CBE Setup</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('content')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'content'
                  ? 'bg-amber-500 text-neutral-950 shadow-md'
                  : 'text-slate-300 hover:bg-[#1e293b] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText size={16} />
                <span>Storefront CMS</span>
              </div>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 w-full max-w-full overflow-x-hidden">
          
          {/* ================= TAB 1: REAL-TIME ANALYTICS ================= */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Live Storefront Performance & Data Tracking</h2>
                <p className="text-xs text-slate-400 mt-1">Real-time visitors, view counts across Addis Ababa, and verified orders.</p>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-lg">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Live Active Visitors</span>
                  <div className="flex items-center gap-2.5 mt-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-3xl font-black text-white">{activeVisitors}</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-semibold mt-2 block">Active right now in Addis</span>
                </div>

                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-lg">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Today's Page Views</span>
                  <div className="text-3xl font-black text-white mt-2">{todayViews}</div>
                  <span className="text-xs text-slate-400 mt-2 block">Storefront visits</span>
                </div>

                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-lg">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Verified Total Revenue</span>
                  <div className="text-2xl font-black text-emerald-400 mt-2 font-mono">
                    ETB {totalRevenue.toLocaleString()}
                  </div>
                  <span className="text-xs text-slate-400 mt-2 block">Telebirr & CBE transfers</span>
                </div>

                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-lg">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Total Orders</span>
                  <div className="text-3xl font-black text-white mt-2">{orders.length}</div>
                  <span className="text-xs text-slate-400 mt-2 block">In delivery queue</span>
                </div>
              </div>

              {/* Subcity Traffic Distribution */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-lg">
                <h3 className="text-sm font-bold text-white mb-3">Orders & Dispatch by Addis Ababa Subcity</h3>
                {orders.length === 0 ? (
                  <p className="text-xs text-slate-400">No customer orders placed yet. Subcity dispatch metrics will automatically calculate from live orders.</p>
                ) : (
                  <div className="space-y-4">
                    {['Bole', 'Yeka', 'Addis Ababa Central', 'Kazanchis', 'Kirkos', 'Lideta'].map(sub => {
                      const count = orders.filter(o => (o.shippingAddress?.subcity || '').toLowerCase().includes(sub.toLowerCase())).length
                      const pct = Math.round((count / orders.length) * 100)
                      return (
                        <div key={sub}>
                          <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-medium">
                            <span>{sub}</span>
                            <strong className="text-amber-400">{count} orders ({pct}%)</strong>
                          </div>
                          <div className="w-full bg-[#1e293b] h-2.5 rounded-full overflow-hidden">
                            <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= TAB 2: ORDERS & DISPATCH ================= */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Customer Orders & Telebirr Verification</h2>
                <p className="text-xs text-slate-400 mt-1">Approve Telebirr / CBE payment references and manage couriers.</p>
              </div>

              {orders.length === 0 ? (
                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                  <Package size={40} className="mx-auto mb-3 text-slate-600" />
                  <p className="text-sm">No customer orders placed yet.</p>
                </div>
              ) : (
                <>
                  {/* Desktop Orders Table (hidden md:block) */}
                  <div className="hidden md:block bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse min-w-[1050px]">
                        <thead>
                          <tr className="bg-[#1e293b] text-slate-300 uppercase font-semibold text-[11px] border-b border-slate-700">
                            <th className="py-3 px-4">Order ID & Ref</th>
                            <th className="py-3 px-4">Customer</th>
                            <th className="py-3 px-4">Subcity</th>
                            <th className="py-3 px-4">Total</th>
                            <th className="py-3 px-4">Payment</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Courier</th>
                            <th className="py-3 px-4 text-right min-w-[320px]">Actions & Dispatch</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80">
                          {orders.map(order => (
                            <tr key={order.id} className="hover:bg-[#162033] transition">
                              <td className="py-3.5 px-4">
                                <strong className="text-white font-mono block">#{order.id}</strong>
                                {order.transactionRef && (
                                  <span className="text-[11px] text-amber-400 font-mono">
                                    Ref: {order.transactionRef}
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 font-semibold text-white">
                                {order.shippingAddress?.recipient}
                                <span className="block text-[11px] text-slate-400 font-normal">
                                  {order.shippingAddress?.phone}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-300">
                                {order.shippingAddress?.subcity}
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                                ETB {order.total?.toLocaleString()}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                  order.paymentStatus === 'paid'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : order.paymentStatus === 'declined'
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                }`}>
                                  {order.paymentStatus === 'paid' ? 'Paid / Approved' : order.paymentStatus === 'declined' ? 'Declined' : 'Pending Verification'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 capitalize text-slate-300 font-medium">
                                {order.status === 'declined' ? (
                                  <span className="text-red-400 font-bold">Declined</span>
                                ) : order.status === 'on_the_way' ? (
                                  <span className="text-blue-400 font-bold">On The Way</span>
                                ) : order.status === 'delivered' ? (
                                  <span className="text-emerald-400 font-bold">Delivered</span>
                                ) : (
                                  order.status.replace(/_/g, ' ')
                                )}
                                {order.declineReason && (
                                  <span className="block text-[10px] text-red-300/80 mt-0.5 truncate max-w-[160px]" title={order.declineReason}>
                                    Reason: {order.declineReason}
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-slate-400">
                                {order.courierName || 'Unassigned'}
                              </td>
                              <td className="py-3.5 px-4 text-right min-w-[320px]">
                                <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                  {/* 1. Payment Approve / Status */}
                                  {order.paymentStatus !== 'paid' ? (
                                    <button
                                      onClick={() => handleApprovePayment(order.id)}
                                      className="bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold px-3 py-1.5 rounded-lg text-xs transition shadow flex items-center gap-1"
                                      title="Approve Telebirr/CBE payment"
                                    >
                                      <CheckCircle2 size={13} />
                                      <span>Approve</span>
                                    </button>
                                  ) : (
                                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold px-2 py-1 rounded-lg text-[11px] flex items-center gap-1">
                                      <CheckCircle2 size={12} />
                                      <span>Approved</span>
                                    </span>
                                  )}

                                  {/* 2. Decline Button */}
                                  <button
                                    onClick={() => {
                                      setDecliningOrderId(order.id)
                                      setDeclineReasonInput(order.declineReason || 'Transaction reference not found in Telebirr statement')
                                    }}
                                    className={`font-bold px-3 py-1.5 rounded-lg text-xs transition border flex items-center gap-1 ${
                                      order.paymentStatus === 'declined'
                                        ? 'bg-red-500/30 text-red-200 border-red-500/60'
                                        : 'bg-red-500/10 hover:bg-red-500/25 text-red-300 border-red-500/30'
                                    }`}
                                    title="Decline payment and write reason"
                                  >
                                    <X size={13} />
                                    <span>{order.paymentStatus === 'declined' ? 'Edit Reason' : 'Decline'}</span>
                                  </button>

                                  {/* 3. Dispatch Progression: On the Way & Delivered */}
                                  {order.paymentStatus === 'paid' && (
                                    <>
                                      {order.status !== 'on_the_way' && order.status !== 'delivered' && (
                                        <button
                                          onClick={() => handleSetOnTheWay(order.id)}
                                          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs transition shadow flex items-center gap-1"
                                          title="Mark order On The Way to customer"
                                        >
                                          <Truck size={13} />
                                          <span>On The Way</span>
                                        </button>
                                      )}

                                      {order.status === 'on_the_way' && (
                                        <button
                                          onClick={() => handleSetDelivered(order.id)}
                                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs transition shadow flex items-center gap-1"
                                          title="Mark order Delivered"
                                        >
                                          <CheckCircle2 size={13} />
                                          <span>Delivered</span>
                                        </button>
                                      )}
                                    </>
                                  )}

                                  {/* 4. Edit details & Delete */}
                                  <button
                                    onClick={() => {
                                      setEditingOrderId(order.id)
                                      setEditCourierName(order.courierName || '')
                                      setEditCourierPhone(order.courierPhone || '')
                                      setEditEta(order.eta || '')
                                      setEditStatus(order.status)
                                      setEditPaymentStatus(order.paymentStatus)
                                    }}
                                    title="Edit courier & status"
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-1.5 rounded-lg text-xs border border-slate-700 transition"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  <button
                                    onClick={() => executeDeleteOrder(order.id)}
                                    title="Delete order"
                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-1.5 rounded-lg text-xs border border-red-500/30 transition"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Smartphone Responsive Cards View for Orders (block md:hidden) */}
                  <div className="block md:hidden space-y-3">
                    {orders.map(order => (
                      <div
                        key={order.id}
                        className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                          <div>
                            <strong className="text-white font-mono text-sm block">#{order.id}</strong>
                            <span className="text-[11px] text-slate-400">{order.date}</span>
                            {order.transactionRef && (
                              <span className="text-[11px] text-amber-400 font-mono block mt-0.5">
                                Ref: {order.transactionRef}
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-bold text-amber-400 text-sm block">
                              ETB {order.total?.toLocaleString()}
                            </span>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${
                              order.paymentStatus === 'paid'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : order.paymentStatus === 'declined'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {order.paymentStatus === 'paid' ? 'Paid / Approved' : order.paymentStatus === 'declined' ? 'Declined' : 'Pending Verification'}
                            </span>
                          </div>
                        </div>

                        {/* Customer & Location */}
                        <div className="bg-[#1e293b]/60 rounded-xl p-2.5 text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Customer:</span>
                            <strong className="text-white">{order.shippingAddress?.recipient}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Phone:</span>
                            <a href={`tel:${order.shippingAddress?.phone}`} className="text-amber-400 font-mono">
                              {order.shippingAddress?.phone}
                            </a>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Sub-City:</span>
                            <span className="text-slate-300">{order.shippingAddress?.subcity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Status:</span>
                            <span className="text-slate-200 capitalize font-medium">
                              {order.status === 'declined' ? (
                                <span className="text-red-400 font-bold">Declined</span>
                              ) : order.status === 'on_the_way' ? (
                                <span className="text-blue-400 font-bold">On The Way</span>
                              ) : order.status === 'delivered' ? (
                                <span className="text-emerald-400 font-bold">Delivered</span>
                              ) : (
                                order.status.replace(/_/g, ' ')
                              )}
                            </span>
                          </div>
                          {order.courierName && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Courier:</span>
                              <span className="text-slate-300 font-mono text-[11px]">{order.courierName}</span>
                            </div>
                          )}
                          {order.declineReason && (
                            <div className="text-[11px] text-red-300/90 pt-1 border-t border-slate-700/60">
                              Reason: {order.declineReason}
                            </div>
                          )}
                        </div>

                        {/* Touch-Friendly Action Buttons on Mobile */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {order.paymentStatus !== 'paid' ? (
                            <button
                              onClick={() => handleApprovePayment(order.id)}
                              className="flex-1 bg-emerald-500 active:bg-emerald-400 text-neutral-950 font-bold py-2 px-3 rounded-xl text-xs transition shadow flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle2 size={14} /> Approve
                            </button>
                          ) : (
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1">
                              <CheckCircle2 size={13} /> Approved
                            </span>
                          )}

                          <button
                            onClick={() => {
                              setDecliningOrderId(order.id)
                              setDeclineReasonInput(order.declineReason || 'Transaction reference not found in Telebirr statement')
                            }}
                            className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-500/10 active:bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1"
                          >
                            <X size={13} /> {order.paymentStatus === 'declined' ? 'Edit Reason' : 'Decline'}
                          </button>

                          {order.paymentStatus === 'paid' && order.status !== 'on_the_way' && order.status !== 'delivered' && (
                            <button
                              onClick={() => handleSetOnTheWay(order.id)}
                              className="bg-blue-600 active:bg-blue-500 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1"
                            >
                              <Truck size={13} /> On The Way
                            </button>
                          )}

                          {order.status === 'on_the_way' && (
                            <button
                              onClick={() => handleSetDelivered(order.id)}
                              className="bg-emerald-600 active:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1"
                            >
                              <CheckCircle2 size={13} /> Delivered
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setEditingOrderId(order.id)
                              setEditCourierName(order.courierName || '')
                              setEditCourierPhone(order.courierPhone || '')
                              setEditEta(order.eta || '')
                              setEditStatus(order.status)
                              setEditPaymentStatus(order.paymentStatus)
                            }}
                            className="p-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700"
                            aria-label="Edit dispatch"
                          >
                            <Edit2 size={14} />
                          </button>

                          <button
                            onClick={() => executeDeleteOrder(order.id)}
                            className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30"
                            aria-label="Delete order"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Order Dispatch Edit Modal */}
              {editingOrderId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                  <div className="bg-[#0f172a] border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl">
                    <h3 className="text-base font-bold text-white mb-4">Edit Order #{editingOrderId}</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Courier Name</label>
                        <input
                          type="text"
                          value={editCourierName}
                          onChange={e => setEditCourierName(e.target.value)}
                          className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Courier Phone</label>
                        <input
                          type="text"
                          value={editCourierPhone}
                          onChange={e => setEditCourierPhone(e.target.value)}
                          className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Arrival</label>
                        <input
                          type="text"
                          value={editEta}
                          onChange={e => setEditEta(e.target.value)}
                          className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                        <select
                          value={editStatus}
                          onChange={e => setEditStatus(e.target.value as any)}
                          className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                        >
                          <option value="confirmed">Confirmed</option>
                          <option value="assembly">In Workshop Assembly</option>
                          <option value="dispatched">Dispatched</option>
                          <option value="out_for_delivery">Out For Delivery</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                      <button
                        onClick={() => setEditingOrderId(null)}
                        className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveOrderDispatch(editingOrderId)}
                        className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-4 py-2 rounded-xl text-xs"
                      >
                        Save Dispatch Details
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Decline Reason Modal */}
              {decliningOrderId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                  <div className="bg-[#0f172a] border border-red-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl">
                    <div className="flex items-center gap-2.5 text-red-400 mb-2 font-bold text-base">
                      <AlertCircle size={20} />
                      <span>Decline Order Payment #{decliningOrderId}</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-4">
                      Write the reason why this payment reference was declined. The customer will immediately see this exact explanation on their tracking screen.
                    </p>
                    <form onSubmit={handleConfirmDecline} className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                          Quick Presets
                        </label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {[
                            'Transaction reference not found in Telebirr statement',
                            'Sent amount does not match total price',
                            'Invalid CBE transaction reference',
                            'Duplicate transaction reference already used'
                          ].map(preset => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setDeclineReasonInput(preset)}
                              className="text-[11px] bg-[#1e293b] hover:bg-[#283548] text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 text-left transition"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Reason to show customer
                        </label>
                        <textarea
                          rows={3}
                          required
                          value={declineReasonInput}
                          onChange={e => setDeclineReasonInput(e.target.value)}
                          placeholder="e.g. Telebirr reference was not found in our bank statement."
                          className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-red-400"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setDecliningOrderId(null)}
                          className="px-4 py-2 text-xs text-slate-400 hover:text-white transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-lg"
                        >
                          Confirm & Decline Order
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: PRODUCTS & REAL IMAGES ================= */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Product Catalog & Real Image Upload</h2>
                  <p className="text-xs text-slate-400 mt-1">Upload real bicycle photos directly from your device, configure specs, and adjust prices.</p>
                </div>
                <button
                  onClick={() => {
                    setIsAddingProduct(true)
                    setEditingProductId(null)
                    setPName('')
                    setPNameAm('')
                    setPPrice(75000)
                    setPImages(['/hero-bike.png'])
                    setPDescription('')
                    setPDescriptionAm('')
                    const isKids = pCategory.toLowerCase().includes('kids')
                    setPRecommendedHeight(isKids ? '115 - 135 cm' : '160 - 185 cm')
                    setPFrame(isKids ? 'High-Tensile Steel' : '6061 Hydroformed Alloy')
                    setPGears(isKids ? 'Single Speed' : 'Shimano 7-Speed')
                    setPBrakes(isKids ? 'Linear-Pull V-Brakes' : 'Hydraulic Disc Brakes')
                    setPWeight(isKids ? '8.8 kg' : '12.2 kg')
                    setPWheels(isKids ? '16" Lightweight Alloy' : '700c Double-Wall Aero Rims')
                    setPWarranty('2 Years Ride Addis Guarantee')
                    setPHasSmall(true)
                    setPPriceSmall(72000)
                    setPAdultSmallCm('155 - 170 cm')
                    setPHasMedium(true)
                    setPPriceMedium(75000)
                    setPAdultMediumCm('168 - 182 cm')
                    setPHasLarge(true)
                    setPPriceLarge(78000)
                    setPAdultLargeCm('180 - 195 cm')
                    setPHasXLarge(false)
                    setPPriceXLarge(82000)
                    setPAdultXLargeCm('188 - 202 cm')
                    setPKidsSizes(DEFAULT_KIDS_SIZES)
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg"
                >
                  <Plus size={15} /> Add New Bicycle / Item
                </button>
              </div>

              {/* Add / Edit Form */}
              {(isAddingProduct || editingProductId) && (
                <div className="bg-[#0f172a] border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-xl">
                  <h3 className="text-base font-bold text-white mb-4">
                    {editingProductId ? 'Edit Product Details' : 'Add New Product with Real Upload'}
                  </h3>

                  <form onSubmit={handleSaveProduct} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Name (English)</label>
                        <input
                          type="text"
                          required
                          value={pName}
                          onChange={e => setPName(e.target.value)}
                          placeholder="e.g. Addis Trail Mountain S"
                          className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Name (Amharic)</label>
                        <input
                          type="text"
                          value={pNameAm}
                          onChange={e => setPNameAm(e.target.value)}
                          placeholder="e.g. አዲስ ትሬል ተራራ"
                          className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                        <select
                          value={pCategory}
                          onChange={e => {
                            const newCat = e.target.value
                            setPCategory(newCat)
                            if (newCat.toLowerCase().includes('kids')) {
                              if (pRecommendedHeight === '160 - 185 cm') {
                                setPRecommendedHeight('115 - 135 cm')
                              }
                            } else {
                              if (pRecommendedHeight === '115 - 135 cm') {
                                setPRecommendedHeight('160 - 185 cm')
                              }
                            }
                          }}
                          className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                        >
                          {categories.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Brand</label>
                        <input
                          type="text"
                          value={pBrand}
                          onChange={e => setPBrand(e.target.value)}
                          className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Price (ETB)</label>
                        <input
                          type="number"
                          required
                          value={pPrice}
                          onChange={e => setPPrice(Number(e.target.value))}
                          className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-2.5 text-white text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Multi-Photo Real Upload & Gallery (Up to 3 Photos per item) */}
                    <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-4 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                            <Upload size={14} /> PRODUCT PHOTOS (ADD UP TO 3 PHOTOS PER ITEM)
                          </label>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Upload multiple angles (Front, Side, Details). You can remove any photo anytime to delete it.
                          </p>
                        </div>
                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-amber-400 self-start sm:self-auto">
                          {pImages.filter(img => img && img !== '/hero-bike.png').length} / 3 Photos
                        </span>
                      </div>

                      {/* 3 Photos Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[0, 1, 2].map((slotIndex) => {
                          const imgUrl = pImages[slotIndex]
                          const hasPhoto = !!imgUrl && (imgUrl !== '/hero-bike.png' || (pImages.length === 1 && slotIndex === 0))
                          const isPlaceholder = imgUrl === '/hero-bike.png'
                          const slotTitle =
                            slotIndex === 0
                              ? 'Photo 1 (Cover)'
                              : slotIndex === 1
                              ? 'Photo 2 (Angle)'
                              : 'Photo 3 (Details)'

                          return (
                            <div
                              key={slotIndex}
                              className={`rounded-xl border p-2.5 flex flex-col justify-between transition relative ${
                                hasPhoto
                                  ? 'bg-slate-900/90 border-slate-700 shadow-sm'
                                  : 'bg-slate-900/30 border-dashed border-slate-700/80 hover:border-amber-400/50'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                                  {slotTitle}
                                </span>
                                {hasPhoto && !isPlaceholder && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveProductImage(slotIndex)}
                                    title="Delete this photo from item and server database"
                                    className="bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded-lg px-2 py-0.5 text-[10px] font-semibold flex items-center gap-1 transition"
                                  >
                                    <Trash2 size={11} /> Remove
                                  </button>
                                )}
                              </div>

                              <div className="h-28 w-full bg-slate-800/80 rounded-lg flex items-center justify-center overflow-hidden relative">
                                {hasPhoto ? (
                                  <img
                                    src={imgUrl}
                                    alt={`Product photo ${slotIndex + 1}`}
                                    className="w-full h-full object-contain p-1"
                                    onError={(e) => {
                                      ;(e.target as HTMLImageElement).src = '/hero-bike.png'
                                    }}
                                  />
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-full flex flex-col items-center justify-center text-slate-500 hover:text-amber-400 transition gap-1 text-xs"
                                  >
                                    <Plus size={20} />
                                    <span className="text-[11px] font-semibold">Upload Photo {slotIndex + 1}</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Upload Trigger Button */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 pt-1 border-t border-slate-800">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={isUploadingImage || pImages.filter(img => img !== '/hero-bike.png').length >= 3}
                          onClick={() => fileInputRef.current?.click()}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                            pImages.filter(img => img !== '/hero-bike.png').length >= 3
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                              : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md font-bold'
                          }`}
                        >
                          <Upload size={14} />
                          {isUploadingImage
                            ? 'Uploading Photo...'
                            : pImages.filter(img => img !== '/hero-bike.png').length >= 3
                            ? 'Max 3 Photos Reached'
                            : `+ Upload Photo (${Math.min(3, pImages.filter(img => img !== '/hero-bike.png').length + 1)}/3)`}
                        </button>

                        <p className="text-[11px] text-slate-400">
                          Photos are saved to disk in /public/uploads/ and appear in customer 3-photo carousel.
                        </p>
                      </div>
                    </div>

                    {/* ================= ENGINEERING SPECIFICATIONS & TECHNICAL BUILD ================= */}
                    <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-4 sm:p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-800">
                        <div>
                          <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                            <Layers size={14} /> ENGINEERING SPECIFICATIONS & TECHNICAL BUILD
                          </label>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Configures the technical specifications displayed in customer product details, comparison sheets, and AI fit guides.
                          </p>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 self-start sm:self-auto">
                          Storefront Sync Active
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* 1. Frame */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-semibold text-slate-300">
                            Frame Material & Geometry
                          </label>
                          <input
                            type="text"
                            value={pFrame}
                            onChange={e => setPFrame(e.target.value)}
                            placeholder="e.g. 6061 Hydroformed Alloy"
                            className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-2 text-white text-xs font-mono"
                          />
                          <div className="flex flex-wrap items-center gap-1 pt-0.5">
                            <span className="text-[9px] text-slate-500 mr-0.5">Presets:</span>
                            {['6061 Hydroformed Alloy', 'Carbon Fiber Composite', 'Chromoly Steel 4130', 'High-Tensile Steel'].map(preset => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setPFrame(preset)}
                                className="text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-700/80 px-1.5 py-0.5 rounded transition"
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 2. Drivetrain & Gears */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-semibold text-slate-300">
                            Drivetrain & Gears
                          </label>
                          <input
                            type="text"
                            value={pGears}
                            onChange={e => setPGears(e.target.value)}
                            placeholder="e.g. Shimano 7-Speed Tourney"
                            className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-2 text-white text-xs font-mono"
                          />
                          <div className="flex flex-wrap items-center gap-1 pt-0.5">
                            <span className="text-[9px] text-slate-500 mr-0.5">Presets:</span>
                            {['Shimano 7-Speed', 'Shimano Deore 10-Speed', 'Shimano Claris 8-Speed', 'Single Speed'].map(preset => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setPGears(preset)}
                                className="text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-700/80 px-1.5 py-0.5 rounded transition"
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 3. Brakes */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-semibold text-slate-300">
                            Brake System
                          </label>
                          <input
                            type="text"
                            value={pBrakes}
                            onChange={e => setPBrakes(e.target.value)}
                            placeholder="e.g. Hydraulic Disc Brakes"
                            className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-2 text-white text-xs font-mono"
                          />
                          <div className="flex flex-wrap items-center gap-1 pt-0.5">
                            <span className="text-[9px] text-slate-500 mr-0.5">Presets:</span>
                            {['Hydraulic Disc Brakes', 'Mechanical Disc Brakes', 'Linear-Pull V-Brakes', 'Dual-Pivot Caliper'].map(preset => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setPBrakes(preset)}
                                className="text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-700/80 px-1.5 py-0.5 rounded transition"
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 4. Wheelset & Tires */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-semibold text-slate-300">
                            Wheelset & Tires
                          </label>
                          <input
                            type="text"
                            value={pWheels}
                            onChange={e => setPWheels(e.target.value)}
                            placeholder="e.g. 700c Double-Wall Aero Rims"
                            className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-2 text-white text-xs font-mono"
                          />
                          <div className="flex flex-wrap items-center gap-1 pt-0.5">
                            <span className="text-[9px] text-slate-500 mr-0.5">Presets:</span>
                            {['700c Double-Wall Aero Rims', '29" Tubeless Ready Boost', '27.5" All-Terrain', '16" Lightweight Alloy'].map(preset => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setPWheels(preset)}
                                className="text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-700/80 px-1.5 py-0.5 rounded transition"
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 5. Weight */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-semibold text-slate-300">
                            Total Weight (kg)
                          </label>
                          <input
                            type="text"
                            value={pWeight}
                            onChange={e => setPWeight(e.target.value)}
                            placeholder="e.g. 12.2 kg"
                            className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-2 text-white text-xs font-mono"
                          />
                          <div className="flex flex-wrap items-center gap-1 pt-0.5">
                            <span className="text-[9px] text-slate-500 mr-0.5">Presets:</span>
                            {['8.8 kg', '10.5 kg', '11.8 kg', '12.2 kg', '13.5 kg', '14.8 kg'].map(preset => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setPWeight(preset)}
                                className="text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-700/80 px-1.5 py-0.5 rounded transition"
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* 6. Warranty */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-semibold text-slate-300">
                            Warranty & Addis Guarantee
                          </label>
                          <input
                            type="text"
                            value={pWarranty}
                            onChange={e => setPWarranty(e.target.value)}
                            placeholder="e.g. 2 Years Ride Addis Guarantee"
                            className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-2 text-white text-xs font-mono"
                          />
                          <div className="flex flex-wrap items-center gap-1 pt-0.5">
                            <span className="text-[9px] text-slate-500 mr-0.5">Presets:</span>
                            {['2 Years Ride Addis Guarantee', 'Lifetime Frame / 2yr Parts', '1 Year Comprehensive', '3 Years Full Coverage'].map(preset => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setPWarranty(preset)}
                                className="text-[9px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-700/80 px-1.5 py-0.5 rounded transition"
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 7. Recommended Rider Height (Full Width) */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-800">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                            <Ruler size={13} className="text-amber-400" /> Recommended Rider Height (cm)
                          </label>
                          <span className="text-[10px] text-slate-400">
                            Shown on Product Cards, Fit Guides & Tech Sheets
                          </span>
                        </div>
                        <input
                          type="text"
                          value={pRecommendedHeight}
                          onChange={e => setPRecommendedHeight(e.target.value)}
                          placeholder={pCategory.toLowerCase().includes('kids') ? 'e.g. 115 - 135 cm' : 'e.g. 160 - 185 cm'}
                          className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-2 text-white text-xs font-mono"
                        />
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span className="text-[10px] text-slate-400 mr-1">Quick Presets:</span>
                          {(pCategory.toLowerCase().includes('kids')
                            ? ['76 - 96 cm', '91 - 101 cm', '101 - 122 cm', '115 - 135 cm', '122 - 152 cm']
                            : ['155 - 175 cm', '160 - 185 cm', '168 - 188 cm', '170 - 192 cm', '175 - 200 cm']
                          ).map(preset => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setPRecommendedHeight(preset)}
                              className="text-[10px] bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-amber-400 border border-slate-700 px-2 py-0.5 rounded-lg transition"
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Sizing & cm Configuration (Dynamic Kids vs Adult Mode) */}
                    {pCategory.toLowerCase().includes('kids') ? (
                      /* ================= KIDS BIKE SIZING (CM & WHEEL SIZES) ================= */
                      <div className="bg-[#1e293b] border border-amber-500/40 rounded-xl p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div>
                            <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                              <Ruler size={14} /> KIDS BIKE SIZES & CM RIDER HEIGHT
                            </label>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Assign kids wheel size brackets and child height in cm (matches the site's Kids Sizing Guide).
                            </p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase self-start sm:self-auto">
                            Kids Bike Mode
                          </span>
                        </div>

                        <div className="space-y-2.5 pt-1">
                          {pKidsSizes.map((ks, idx) => (
                            <div
                              key={ks.id}
                              className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                                ks.enabled ? 'bg-slate-900/90 border-amber-500/50' : 'bg-slate-900/30 border-slate-800 opacity-60'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={ks.enabled}
                                  onChange={e => {
                                    const updated = [...pKidsSizes]
                                    updated[idx].enabled = e.target.checked
                                    setPKidsSizes(updated)
                                  }}
                                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                                />
                                <div>
                                  <span className="text-xs font-bold text-white block">{ks.label}</span>
                                  <span className="text-[10px] text-slate-400">{ks.ageGroup}</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full sm:max-w-md">
                                <div className="flex-1 min-w-0">
                                  <label className="text-[10px] text-slate-400 block mb-0.5">Rider Height (cm)</label>
                                  <input
                                    type="text"
                                    disabled={!ks.enabled}
                                    value={ks.heightCm}
                                    onChange={e => {
                                      const updated = [...pKidsSizes]
                                      updated[idx].heightCm = e.target.value
                                      setPKidsSizes(updated)
                                    }}
                                    placeholder="e.g. 101 - 122 cm"
                                    className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-2 text-white text-xs font-mono disabled:opacity-50"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <label className="text-[10px] text-slate-400 block mb-0.5">Price (ETB)</label>
                                  <input
                                    type="number"
                                    disabled={!ks.enabled}
                                    value={ks.price}
                                    onChange={e => {
                                      const updated = [...pKidsSizes]
                                      updated[idx].price = Number(e.target.value)
                                      setPKidsSizes(updated)
                                    }}
                                    className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-2 text-white text-xs font-mono disabled:opacity-50"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* ================= ADULT BIKE SIZING (CM & FRAME SIZES) ================= */
                      <div className="bg-[#1e293b] border border-slate-700 rounded-xl p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div>
                            <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                              <Ruler size={14} /> ADULT FRAME SIZES & CM RIDER HEIGHT
                            </label>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Assign frame sizes, rider height in cm, and individual prices for adult cyclists in Addis Ababa.
                            </p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase self-start sm:self-auto">
                            Adult Bike Mode
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                          {/* Small Size */}
                          <div className={`p-3 rounded-xl border transition-all ${pHasSmall ? 'bg-slate-900/90 border-amber-500/50' : 'bg-slate-900/30 border-slate-800 opacity-60'}`}>
                            <label className="flex items-center gap-2 cursor-pointer mb-2">
                              <input
                                type="checkbox"
                                checked={pHasSmall}
                                onChange={(e) => setPHasSmall(e.target.checked)}
                                className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                              />
                              <span className="text-xs font-bold text-white">Small (S)</span>
                            </label>
                            {pHasSmall && (
                              <div className="space-y-2">
                                <div>
                                  <label className="text-[10px] text-slate-400 block mb-0.5">Rider Height (cm)</label>
                                  <input
                                    type="text"
                                    value={pAdultSmallCm}
                                    onChange={(e) => setPAdultSmallCm(e.target.value)}
                                    placeholder="e.g. 155 - 170 cm"
                                    className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-2 text-white text-xs font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 block mb-0.5">Price (ETB)</label>
                                  <input
                                    type="number"
                                    value={pPriceSmall}
                                    onChange={(e) => setPPriceSmall(Number(e.target.value))}
                                    className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-2 text-white text-xs font-mono"
                                    placeholder="ETB"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Medium Size */}
                          <div className={`p-3 rounded-xl border transition-all ${pHasMedium ? 'bg-slate-900/90 border-amber-500/50' : 'bg-slate-900/30 border-slate-800 opacity-60'}`}>
                            <label className="flex items-center gap-2 cursor-pointer mb-2">
                              <input
                                type="checkbox"
                                checked={pHasMedium}
                                onChange={(e) => setPHasMedium(e.target.checked)}
                                className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                              />
                              <span className="text-xs font-bold text-white">Medium (M)</span>
                            </label>
                            {pHasMedium && (
                              <div className="space-y-2">
                                <div>
                                  <label className="text-[10px] text-slate-400 block mb-0.5">Rider Height (cm)</label>
                                  <input
                                    type="text"
                                    value={pAdultMediumCm}
                                    onChange={(e) => setPAdultMediumCm(e.target.value)}
                                    placeholder="e.g. 168 - 182 cm"
                                    className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-2 text-white text-xs font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 block mb-0.5">Price (ETB)</label>
                                  <input
                                    type="number"
                                    value={pPriceMedium}
                                    onChange={(e) => setPPriceMedium(Number(e.target.value))}
                                    className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-2 text-white text-xs font-mono"
                                    placeholder="ETB"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Large Size */}
                          <div className={`p-3 rounded-xl border transition-all ${pHasLarge ? 'bg-slate-900/90 border-amber-500/50' : 'bg-slate-900/30 border-slate-800 opacity-60'}`}>
                            <label className="flex items-center gap-2 cursor-pointer mb-2">
                              <input
                                type="checkbox"
                                checked={pHasLarge}
                                onChange={(e) => setPHasLarge(e.target.checked)}
                                className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                              />
                              <span className="text-xs font-bold text-white">Large (L)</span>
                            </label>
                            {pHasLarge && (
                              <div className="space-y-2">
                                <div>
                                  <label className="text-[10px] text-slate-400 block mb-0.5">Rider Height (cm)</label>
                                  <input
                                    type="text"
                                    value={pAdultLargeCm}
                                    onChange={(e) => setPAdultLargeCm(e.target.value)}
                                    placeholder="e.g. 180 - 195 cm"
                                    className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-2 text-white text-xs font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 block mb-0.5">Price (ETB)</label>
                                  <input
                                    type="number"
                                    value={pPriceLarge}
                                    onChange={(e) => setPPriceLarge(Number(e.target.value))}
                                    className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-2 text-white text-xs font-mono"
                                    placeholder="ETB"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Extra Large Size (XL) */}
                          <div className={`p-3 rounded-xl border transition-all ${pHasXLarge ? 'bg-slate-900/90 border-amber-500/50' : 'bg-slate-900/30 border-slate-800 opacity-60'}`}>
                            <label className="flex items-center gap-2 cursor-pointer mb-2">
                              <input
                                type="checkbox"
                                checked={pHasXLarge}
                                onChange={(e) => setPHasXLarge(e.target.checked)}
                                className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                              />
                              <span className="text-xs font-bold text-white">Extra Large (XL)</span>
                            </label>
                            {pHasXLarge && (
                              <div className="space-y-2">
                                <div>
                                  <label className="text-[10px] text-slate-400 block mb-0.5">Rider Height (cm)</label>
                                  <input
                                    type="text"
                                    value={pAdultXLargeCm}
                                    onChange={(e) => setPAdultXLargeCm(e.target.value)}
                                    placeholder="e.g. 188 - 202 cm"
                                    className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-2 text-white text-xs font-mono"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 block mb-0.5">Price (ETB)</label>
                                  <input
                                    type="number"
                                    value={pPriceXLarge}
                                    onChange={(e) => setPPriceXLarge(Number(e.target.value))}
                                    className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-2 text-white text-xs font-mono"
                                    placeholder="ETB"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingProduct(false)
                          setEditingProductId(null)
                        }}
                        className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-5 py-2 rounded-xl text-xs"
                      >
                        Save Product
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Products Table (Desktop: hidden md:block) */}
              <div className="hidden md:block bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse min-w-[620px]">
                    <thead>
                      <tr className="bg-[#1e293b] text-slate-300 uppercase font-semibold text-[11px] border-b border-slate-700">
                        <th className="py-3 px-4">Photo</th>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Brand</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {products.map(p => (
                        <tr key={p.id} className="hover:bg-[#162033] transition">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <div className="w-12 h-12 rounded-lg bg-slate-800 p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                                <img src={p.images[0] || '/hero-bike.png'} alt="" className="max-w-full max-h-full object-contain" />
                              </div>
                              {p.images && p.images.length > 1 && (
                                <span className="text-[10px] bg-slate-800 text-amber-400 font-mono px-1.5 py-0.5 rounded border border-slate-700">
                                  {p.images.length} photos
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <strong className="text-white text-xs block">{p.name}</strong>
                            <span className="text-[11px] text-slate-400">{p.am}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-300">{p.category}</td>
                          <td className="py-3 px-4 text-slate-300">{p.brand}</td>
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-amber-400 block">{p.priceFormatted}</span>
                            {p.specs?.recommendedHeight && (
                              <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono inline-flex items-center gap-1 mt-0.5">
                                📏 {p.specs.recommendedHeight}
                              </span>
                            )}
                            {p.sizes && p.sizes.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {p.sizes.map(sz => (
                                  <span key={sz.size} className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                                    {sz.size} {sz.heightCm ? `(${sz.heightCm})` : ''}: ETB {sz.price.toLocaleString()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleStartEditProduct(p)}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg text-xs border border-slate-700 transition"
                                title="Edit product"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                onClick={() => executeDeleteProduct(p.id)}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2.5 py-1.5 rounded-lg text-xs border border-red-500/30 transition"
                                title="Delete product"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Smartphone Touch Product Cards (Mobile: block md:hidden) */}
              <div className="block md:hidden space-y-3">
                {products.map(p => (
                  <div
                    key={p.id}
                    className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 p-1.5 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                        <img
                          src={p.images[0] || '/hero-bike.png'}
                          alt={p.name}
                          className="max-w-full max-h-full object-contain"
                        />
                        {p.images && p.images.length > 1 && (
                          <span className="absolute bottom-0.5 right-0.5 text-[9px] bg-slate-950/90 text-amber-400 font-mono px-1 py-0.2 rounded border border-slate-800">
                            {p.images.length}📷
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {p.category}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {p.brand}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white truncate mt-1">{p.name}</h4>
                        <p className="text-[11px] text-slate-400 truncate">{p.am}</p>
                        <div className="text-sm font-mono font-black text-amber-400 mt-1">
                          {p.priceFormatted}
                        </div>
                      </div>
                    </div>

                    {p.specs?.recommendedHeight && (
                      <div className="text-[10px] text-amber-300 font-mono inline-flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        📏 Height: {p.specs.recommendedHeight}
                      </div>
                    )}
                    {p.sizes && p.sizes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-800/80">
                        {p.sizes.map(sz => (
                          <span
                            key={sz.size}
                            className="text-[10px] bg-[#1e293b] border border-slate-700/80 text-slate-300 px-2 py-0.5 rounded-lg font-mono"
                          >
                            {sz.size} {sz.heightCm ? `(${sz.heightCm})` : ''}: ETB {sz.price.toLocaleString()}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                      <button
                        onClick={() => handleStartEditProduct(p)}
                        className="flex-1 bg-slate-800 active:bg-slate-700 text-slate-200 border border-slate-700 font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <Edit2 size={13} /> Edit Item & Photos
                      </button>
                      <button
                        onClick={() => executeDeleteProduct(p.id)}
                        className="p-2 bg-red-500/10 active:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs flex items-center justify-center transition"
                        aria-label="Delete product"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 4: CATEGORIES CRUD ================= */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Categories CRUD Management</h2>
                  <p className="text-xs text-slate-400 mt-1">Add, rename, or delete categories. Updates live storefront tabs instantly.</p>
                </div>
                <button
                  onClick={() => {
                    setIsAddingCategory(true)
                    setEditingCategoryId(null)
                    setCName('')
                    setCNameAm('')
                    setCDescription('')
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg"
                >
                  <Plus size={15} /> Add Category
                </button>
              </div>

              {/* Add / Edit Form */}
              {(isAddingCategory || editingCategoryId) && (
                <div className="bg-[#0f172a] border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-xl">
                  <h3 className="text-base font-bold text-white mb-4">
                    {editingCategoryId ? 'Edit Category' : 'Create New Category'}
                  </h3>
                  <form onSubmit={handleSaveCategory} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Name (English)</label>
                        <input
                          type="text"
                          required
                          value={cName}
                          onChange={e => setCName(e.target.value)}
                          placeholder="e.g. Gravel Bikes"
                          className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Name (Amharic)</label>
                        <input
                          type="text"
                          value={cNameAm}
                          onChange={e => setCNameAm(e.target.value)}
                          placeholder="e.g. የጠጠር መንገድ ብስክሌቶች"
                          className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                      <input
                        type="text"
                        value={cDescription}
                        onChange={e => setCDescription(e.target.value)}
                        placeholder="Description for Addis Ababa riders"
                        className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingCategory(false)
                          setEditingCategoryId(null)
                        }}
                        className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-5 py-2 rounded-xl text-xs"
                      >
                        Save Category
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(cat => (
                  <div key={cat.id} className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs bg-[#1e293b] text-amber-400 px-2.5 py-1 rounded-full font-mono font-semibold">
                          {products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length} items
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-base">{cat.name}</h4>
                      <p className="text-xs text-amber-400 font-medium">{cat.nameAm}</p>
                      {cat.description && (
                        <p className="text-xs text-slate-400 mt-2">{cat.description}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setEditingCategoryId(cat.id)
                          setIsAddingCategory(false)
                          setCName(cat.name)
                          setCNameAm(cat.nameAm)
                          setCDescription(cat.description || '')
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-xs border border-slate-700 transition"
                      >
                        Edit
                      </button>
                      {cat.name !== 'All' && (
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2.5 py-1 rounded-lg text-xs border border-red-500/30 transition"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 5: GOOGLE REVIEWS CRUD ================= */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Google Customer Reviews Management</h2>
                  <p className="text-xs text-slate-400 mt-1">Manage and curate verified customer reviews displayed on the storefront.</p>
                </div>
                <button
                  onClick={() => {
                    setIsAddingReview(true)
                    setEditingReviewId(null)
                    setRAuthor('')
                    setRTextEn('')
                    setRTextAm('')
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg"
                >
                  <Plus size={15} /> Add Review
                </button>
              </div>

              {/* Add / Edit Review */}
              {(isAddingReview || editingReviewId) && (
                <div className="bg-[#0f172a] border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-xl">
                  <h3 className="text-base font-bold text-white mb-4">
                    {editingReviewId ? 'Edit Review' : 'Add New Review'}
                  </h3>
                  <form onSubmit={handleSaveReview} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Author Name</label>
                        <input
                          type="text"
                          required
                          value={rAuthor}
                          onChange={e => setRAuthor(e.target.value)}
                          placeholder="e.g. Yared Mengistu"
                          className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
                        <input
                          type="text"
                          value={rLocation}
                          onChange={e => setRLocation(e.target.value)}
                          placeholder="Bole, Addis Ababa"
                          className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Bike Purchased</label>
                        <input
                          type="text"
                          value={rBikeModel}
                          onChange={e => setRBikeModel(e.target.value)}
                          placeholder="Addis Commuter 01"
                          className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Star Rating ({rRating}/5)</label>
                        <div className="flex items-center gap-1 mt-1 bg-[#1e293b] p-1.5 rounded-xl border border-slate-700 w-fit">
                          {[1, 2, 3, 4, 5].map(num => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setRRating(num)}
                              className="p-1 hover:scale-120 active:scale-95 transition cursor-pointer"
                              aria-label={`Rate ${num} stars`}
                            >
                              <Star
                                size={18}
                                fill={rRating >= num ? '#f59e0b' : 'transparent'}
                                color={rRating >= num ? '#f59e0b' : '#64748b'}
                                style={{ fill: rRating >= num ? '#f59e0b' : 'transparent' }}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Review (English)</label>
                        <textarea
                          rows={3}
                          required
                          value={rTextEn}
                          onChange={e => setRTextEn(e.target.value)}
                          className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Review (Amharic)</label>
                        <textarea
                          rows={3}
                          value={rTextAm}
                          onChange={e => setRTextAm(e.target.value)}
                          className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingReview(false)
                          setEditingReviewId(null)
                        }}
                        className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-5 py-2 rounded-xl text-xs"
                      >
                        Save Review
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Reviews List with Monograms */}
              <div className="space-y-3">
                {reviews.map(rev => {
                  const initial = rev.authorName.trim().charAt(0).toUpperCase()
                  return (
                    <div
                      key={rev.id}
                      className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start justify-between gap-4 shadow-lg"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-full bg-amber-500 text-neutral-950 font-black text-lg flex items-center justify-center flex-shrink-0">
                          {initial}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-white text-sm">{rev.authorName}</strong>
                            <span className="text-xs text-slate-400">({rev.authorLocation})</span>
                            <span className="text-xs text-amber-400 font-bold">{rev.rating} / 5</span>
                          </div>
                          <span className="inline-block bg-[#1e293b] text-slate-300 text-[11px] px-2.5 py-0.5 rounded font-mono mt-1 mb-1.5">
                            {rev.bikeModel}
                          </span>
                          <p className="text-xs text-slate-300 leading-relaxed">"{rev.reviewEn}"</p>
                          <p className="text-xs text-slate-400 mt-1">አማርኛ: "{rev.reviewAm}"</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => {
                            setEditingReviewId(rev.id)
                            setIsAddingReview(false)
                            setRAuthor(rev.authorName)
                            setRLocation(rev.authorLocation)
                            setRBikeModel(rev.bikeModel)
                            setRRating(rev.rating)
                            setRTextEn(rev.reviewEn)
                            setRTextAm(rev.reviewAm)
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs border border-slate-700 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs border border-red-500/30 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 6: TELEBIRR & BANK CONFIG ================= */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Payment Gateway Configuration</h2>
                  <p className="text-xs text-slate-400 mt-1">Manage Telebirr Merchant Codes and Commercial Bank of Ethiopia (CBE) accounts.</p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
                >
                  <Save size={15} />
                  <span>{isSavingSettings ? 'Saving...' : 'Save Payment Gateways'}</span>
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
                  <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <CreditCard size={16} /> Telebirr Payment Gateway
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Telebirr Phone Number</label>
                      <input
                        type="text"
                        value={settings.telebirrPhone || settings.telebirrMerchantCode || ''}
                        onChange={e => setSettings({ ...settings, telebirrPhone: e.target.value, telebirrMerchantCode: e.target.value })}
                        className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-2.5 text-white text-xs font-mono"
                        placeholder="0966245048"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Account Holder Name</label>
                      <input
                        type="text"
                        value={settings.telebirrMerchantName}
                        onChange={e => setSettings({ ...settings, telebirrMerchantName: e.target.value })}
                        className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                        placeholder="Fraol Woldekidan"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
                  <h3 className="text-sm font-bold text-sky-400 flex items-center gap-2">
                    <CreditCard size={16} /> CBEBirr Payment Gateway
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">CBEBirr Phone Number</label>
                      <input
                        type="text"
                        value={settings.cbebirrPhone || ''}
                        onChange={e => setSettings({ ...settings, cbebirrPhone: e.target.value })}
                        className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-2.5 text-white text-xs font-mono"
                        placeholder="0966245048"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Account Holder Name</label>
                      <input
                        type="text"
                        value={settings.cbebirrName || ''}
                        onChange={e => setSettings({ ...settings, cbebirrName: e.target.value })}
                        className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                        placeholder="Fraol Woldekidan"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <DollarSign size={16} /> Commercial Bank of Ethiopia (CBE Bank Account)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">CBE Account Number</label>
                      <input
                        type="text"
                        value={settings.cbeAccountNumber}
                        onChange={e => setSettings({ ...settings, cbeAccountNumber: e.target.value })}
                        className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-2.5 text-white text-xs font-mono"
                        placeholder="1000359050047"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Account Holder Name</label>
                      <input
                        type="text"
                        value={settings.cbeAccountName}
                        onChange={e => setSettings({ ...settings, cbeAccountName: e.target.value })}
                        className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                        placeholder="Fraol Woldekidan"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">CBE Bank Branch / Hub</label>
                    <input
                      type="text"
                      value={settings.cbeBankBranch}
                      onChange={e => setSettings({ ...settings, cbeBankBranch: e.target.value })}
                      className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                      placeholder="Commercial Bank of Ethiopia (CBE)"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
                  >
                    <Save size={15} />
                    <span>{isSavingSettings ? 'Saving...' : 'Save Payment Gateways'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= TAB 7: STOREFRONT CMS ================= */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">Storefront CMS & Live Announcements</h2>
                  <p className="text-xs text-slate-400 mt-1">Configure real top notice bar announcements, hotline, and store info in real-time.</p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
                >
                  <Save size={15} />
                  <span>{isSavingSettings ? 'Saving...' : 'Save Storefront CMS'}</span>
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Top Marquee Bar & Free Delivery Announcements</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    This text scrolls continuously in the top ticker of the storefront for all customers across Addis Ababa.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Top Marquee Notice (English)
                      </label>
                      <input
                        type="text"
                        value={settings.bannerNotice}
                        onChange={e => setSettings({ ...settings, bannerNotice: e.target.value })}
                        placeholder="e.g. FREE DELIVERY IN ADDIS ABABA ON ORDERS OVER ETB 50,000 · ASSEMBLED READY-TO-RIDE"
                        className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Store Announcement & Promotion (Amharic)
                      </label>
                      <input
                        type="text"
                        value={settings.announcementAm}
                        onChange={e => setSettings({ ...settings, announcementAm: e.target.value })}
                        placeholder="e.g. ጥራት ያለው ጉዞ ከአዲስ አበባ · ሙሉ ለሙሉ የተገጣጠሙ ብስክሌቶች"
                        className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Phone size={15} className="text-amber-400" />
                    <span>Customer Hotline & Support Contact</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Support Phone</label>
                      <input
                        type="text"
                        value={settings.telebirrPhone}
                        onChange={e => setSettings({ ...settings, telebirrPhone: e.target.value })}
                        className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-2.5 text-white text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Workshop & Assembly Branch</label>
                      <input
                        type="text"
                        value={settings.cbeBankBranch}
                        onChange={e => setSettings({ ...settings, cbeBankBranch: e.target.value })}
                        className="w-full bg-[#1e293b] border border-slate-700 rounded-xl p-2.5 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-950 font-bold px-6 py-2.5 rounded-xl text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
                  >
                    <Save size={15} />
                    <span>{isSavingSettings ? 'Saving...' : 'Save Storefront CMS'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= TAB 8: REGISTERED CYCLISTS (USERS) ================= */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <Users className="text-amber-400" size={22} />
                    <span>Registered Cyclists & Customer Database</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Verified live store accounts with phone numbers, order count, and delivery coordinates across Addis Ababa.
                  </p>
                </div>
              </div>

              {/* Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Total Cyclists</span>
                  <div className="text-2xl sm:text-3xl font-black text-white mt-1">{registeredUsers.length}</div>
                  <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">Verified accounts</span>
                </div>

                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Ordered Items</span>
                  <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
                    {registeredUsers.filter(u => (u.ordersCount || 0) > 0).length}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">Active shoppers</span>
                </div>

                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Account Revenue</span>
                  <div className="text-lg sm:text-xl font-black text-emerald-400 mt-1 font-mono">
                    ETB {registeredUsers.reduce((sum, u) => sum + (u.totalSpent || 0), 0).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">Total customer LTV</span>
                </div>

                <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Addis Central / Bole</span>
                  <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                    {registeredUsers.filter(u => (u.subcity || '').toLowerCase().includes('bole') || (u.subcity || '').toLowerCase().includes('addis') || (u.subcity || '').toLowerCase().includes('kazanchis')).length}
                  </div>
                  <span className="text-[11px] text-amber-400 font-semibold mt-1 block">Prime dispatch zone</span>
                </div>
              </div>

              {/* Search Bar */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={e => setUserSearchTerm(e.target.value)}
                    placeholder="Search cyclists by name, phone (+251/09...), email, or subcity..."
                    className="w-full bg-[#1e293b] border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  {userSearchTerm && (
                    <button
                      onClick={() => setUserSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="text-xs text-slate-400 font-mono px-2 self-end sm:self-auto">
                  Showing{' '}
                  <strong className="text-white">
                    {registeredUsers.filter(u => {
                      const term = userSearchTerm.toLowerCase()
                      return (
                        u.name.toLowerCase().includes(term) ||
                        u.email.toLowerCase().includes(term) ||
                        u.phone.toLowerCase().includes(term) ||
                        u.subcity.toLowerCase().includes(term)
                      )
                    }).length}
                  </strong>{' '}
                  of {registeredUsers.length} cyclists
                </div>
              </div>

              {/* USERS LIST: Responsive Desktop Table (hidden md:block) */}
              <div className="hidden md:block bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#1e293b]/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-5 py-3.5">Cyclist</th>
                        <th className="px-5 py-3.5">Phone</th>
                        <th className="px-5 py-3.5">Email</th>
                        <th className="px-5 py-3.5">Sub-City & Addresses</th>
                        <th className="px-5 py-3.5">Orders</th>
                        <th className="px-5 py-3.5">Total Spent</th>
                        <th className="px-5 py-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {registeredUsers
                        .filter(u => {
                          const term = userSearchTerm.toLowerCase()
                          return (
                            u.name.toLowerCase().includes(term) ||
                            u.email.toLowerCase().includes(term) ||
                            u.phone.toLowerCase().includes(term) ||
                            u.subcity.toLowerCase().includes(term)
                          )
                        })
                        .map((u) => {
                          const initial = (u.name || 'U').trim().charAt(0).toUpperCase()
                          return (
                            <tr key={u.id} className="hover:bg-slate-800/40 transition">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-amber-500 text-neutral-950 font-black flex items-center justify-center text-sm flex-shrink-0 shadow-sm">
                                    {initial}
                                  </div>
                                  <div>
                                    <div className="font-bold text-white text-sm">{u.name}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">
                                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active Member'}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4 font-mono font-semibold text-amber-400">
                                <div className="flex items-center gap-1.5">
                                  <Phone size={13} className="text-slate-400" />
                                  <span>{u.phone}</span>
                                </div>
                              </td>

                              <td className="px-5 py-4 text-slate-300">
                                <div className="flex items-center gap-1.5">
                                  <Mail size={13} className="text-slate-400" />
                                  <span>{u.email}</span>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center gap-1.5 text-slate-200">
                                  <MapPin size={13} className="text-amber-400 flex-shrink-0" />
                                  <span>{u.subcity}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                                  {u.addresses?.length || 0} saved address(es)
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                  (u.ordersCount || 0) > 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {u.ordersCount || 0} order(s)
                                </span>
                              </td>

                              <td className="px-5 py-4 font-mono font-bold text-slate-100">
                                {(u.totalSpent || 0) > 0 ? `ETB ${(u.totalSpent || 0).toLocaleString()}` : '-'}
                              </td>

                              <td className="px-5 py-4 text-right">
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.name)}
                                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition"
                                  title="Delete cyclist account"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          )
                        })}

                      {registeredUsers.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-slate-400 text-xs">
                            <Users size={32} className="mx-auto mb-3 opacity-30" />
                            No registered cyclists found in database. New customer registrations on the website will appear here in real time.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* USERS LIST: Deep Smartphone Responsive Cards (block md:hidden) */}
              <div className="block md:hidden space-y-3">
                {registeredUsers
                  .filter(u => {
                    const term = userSearchTerm.toLowerCase()
                    return (
                      u.name.toLowerCase().includes(term) ||
                      u.email.toLowerCase().includes(term) ||
                      u.phone.toLowerCase().includes(term) ||
                      u.subcity.toLowerCase().includes(term)
                    )
                  })
                  .map(u => {
                    const initial = (u.name || 'U').trim().charAt(0).toUpperCase()
                    return (
                      <div
                        key={u.id}
                        className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3 hover:border-slate-700 transition"
                      >
                        {/* Top user row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-500 text-neutral-950 font-black flex items-center justify-center text-sm flex-shrink-0 shadow-md">
                              {initial}
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-sm leading-tight">{u.name}</h4>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Verified Cyclist'}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="p-2 rounded-xl bg-red-500/10 active:bg-red-500/20 text-red-400 border border-red-500/20"
                            aria-label={`Delete ${u.name}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Contact details */}
                        <div className="bg-[#1e293b]/70 rounded-xl p-3 space-y-2 border border-slate-800 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <Phone size={12} className="text-amber-400" /> Phone:
                            </span>
                            <a
                              href={`tel:${u.phone}`}
                              className="font-mono font-bold text-amber-400 active:underline"
                            >
                              {u.phone}
                            </a>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <Mail size={12} className="text-slate-400" /> Email:
                            </span>
                            <span className="text-slate-200 truncate max-w-[180px] font-mono text-[11px]">
                              {u.email}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <MapPin size={12} className="text-emerald-400" /> Sub-City:
                            </span>
                            <span className="text-slate-200 font-medium">
                              {u.subcity}
                            </span>
                          </div>
                        </div>

                        {/* Order stats footer */}
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            (u.ordersCount || 0) > 0
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {u.ordersCount || 0} orders placed
                          </span>

                          <span className="font-mono font-bold text-slate-300 text-xs">
                            {(u.totalSpent || 0) > 0 ? `ETB ${(u.totalSpent || 0).toLocaleString()}` : '0 ETB'}
                          </span>
                        </div>
                      </div>
                    )
                  })}

                {registeredUsers.length === 0 && (
                  <div className="text-center py-10 bg-[#0f172a] rounded-2xl border border-slate-800 text-slate-400 text-xs p-6">
                    <Users size={32} className="mx-auto mb-3 opacity-30" />
                    No registered cyclists yet. When customers register accounts on the website, they will appear here in real time.
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
