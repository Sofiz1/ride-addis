import { Product, PRODUCTS } from './catalog'

export interface Address {
  id: string
  label: string
  recipient: string
  phone: string
  subcity: string
  street: string
  landmark?: string
  isDefault?: boolean
}

export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  subcity: string
  addresses: Address[]
  passwordHash?: string
  createdAt?: string
  role?: 'customer' | 'admin'
}

/**
 * Normalizes Ethiopian phone numbers into a standard international format: +251 9... / +251 7...
 * Handles 0911234567, +251911234567, 911234567, spaces, hyphens.
 */
export function normalizeEthiopianPhone(phone: string): string {
  if (!phone) return ''
  // Strip all non-digits except initial +
  const cleaned = phone.trim().replace(/[^\d+]/g, '')
  const digitsOnly = cleaned.replace(/\D/g, '')

  if (digitsOnly.startsWith('251') && digitsOnly.length === 12) {
    return '+251' + digitsOnly.slice(3)
  }
  if (digitsOnly.startsWith('0') && digitsOnly.length === 10) {
    return '+251' + digitsOnly.slice(1)
  }
  if (digitsOnly.length === 9 && (digitsOnly.startsWith('9') || digitsOnly.startsWith('7'))) {
    return '+251' + digitsOnly
  }
  return cleaned
}

/**
 * Validates Ethiopian phone number format (must be 9 digits after 0 or +251, starting with 9 or 7).
 */
export function isValidEthiopianPhone(phone: string): boolean {
  const normalized = normalizeEthiopianPhone(phone)
  return /^\+251[79]\d{8}$/.test(normalized)
}

/**
 * Validates password strength (minimum 8 chars, at least one letter, and at least one number).
 */
export function validatePasswordStrength(password: string): { isValid: boolean; error?: string; score: number } {
  if (!password || password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long.', score: 1 }
  }
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^a-zA-Z0-9]/.test(password)

  if (!hasLetter || !hasNumber) {
    return { isValid: false, error: 'Password must contain both letters and numbers.', score: 2 }
  }

  let score = 2
  if (password.length >= 10) score += 1
  if (hasSpecial) score += 1

  return { isValid: true, score: Math.min(score, 4) }
}

export interface CartItem {
  product: Product
  quantity: number
  selectedSize?: string
}

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

export interface Order {
  id: string
  date: string
  items: OrderItem[]
  total: number
  shippingAddress: Address
  paymentMethod: 'telebirr' | 'cbe_birr' | 'cash_on_delivery' | 'bank_transfer'
  paymentStatus: 'paid' | 'approved' | 'pending' | 'pending_approval' | 'rejected' | 'declined'
  transactionRef?: string
  status: 'confirmed' | 'approved' | 'on_the_way' | 'out_for_delivery' | 'delivered' | 'declined' | 'assembly' | 'dispatched'
  statusStep: number
  eta: string
  courierName: string
  courierPhone: string
  declineReason?: string
}

export interface AdminSettings {
  telebirrMerchantCode: string
  telebirrMerchantName: string
  telebirrPhone: string
  cbebirrPhone?: string
  cbebirrName?: string
  cbeAccountNumber: string
  cbeAccountName: string
  cbeBankBranch: string
  heroTitleEn: string
  heroTitleAm: string
  heroSubtitleEn: string
  heroSubtitleAm: string
  bannerNotice: string
  announcementAm: string
}

const STORAGE_KEYS = {
  USER: 'ride_addis_user',
  CART: 'ride_addis_cart',
  WISHLIST: 'ride_addis_wishlist',
  ORDERS: 'ride_addis_orders',
  SETTINGS: 'ride_addis_admin_settings',
  PRODUCTS: 'ride_addis_custom_products'
}

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  telebirrMerchantCode: '0966245048',
  telebirrMerchantName: 'Fraol Woldekidan',
  telebirrPhone: '0966245048',
  cbebirrPhone: '0966245048',
  cbebirrName: 'Fraol Woldekidan',
  cbeAccountNumber: '1000359050047',
  cbeAccountName: 'Fraol Woldekidan',
  cbeBankBranch: 'Commercial Bank of Ethiopia (CBE)',
  heroTitleEn: 'Move through Addis differently.',
  heroTitleAm: 'አዲስን በአዲስ መንገድ ይጓዙ።',
  heroSubtitleEn: 'Bicycles selected for Addis altitude, climbs, and streets. Discover a better way to move.',
  heroSubtitleAm: 'ለከተማችን ምት የተሰራ የብስክሌት ልምድ። ከአስፋልት እስከ ዕንጦጦ ተራራ ድረስ።',
  bannerNotice: 'FREE DELIVERY IN ADDIS ABABA ON ORDERS OVER ETB 50,000 · ASSEMBLED READY-TO-RIDE',
  announcementAm: 'ጥራት ያለው ጉዞ ከአዲስ አበባ'
}

// Initial demo user (logged out by default, user logs in via demo or credentials)
export const DEMO_USER: UserProfile = {
  id: 'usr_01',
  name: 'Dawit Haile',
  email: 'dawit.haile@addiscycling.et',
  phone: '+251 91 124 5678',
  subcity: 'Addis Ababa',
  addresses: [
    {
      id: 'addr_01',
      label: 'Home',
      recipient: 'Dawit Haile',
      phone: '+251 91 124 5678',
      subcity: 'Addis Ababa',
      street: 'Ring Road Avenue',
      landmark: 'Near City Center',
      isDefault: true
    },
    {
      id: 'addr_02',
      label: 'Work / Studio',
      recipient: 'Dawit Haile',
      phone: '+251 91 124 5678',
      subcity: 'Kazanchis',
      street: 'Tito Street, Bloom Tower 4th Fl',
      landmark: 'Opposite UNECA Gate',
      isDefault: false
    }
  ]
}

export const DEMO_ORDERS: Order[] = []

export function loadUserFromStorage(): UserProfile | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(STORAGE_KEYS.USER)
  if (!stored) return null
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function saveUserToStorage(user: UserProfile | null) {
  if (typeof window === 'undefined') return
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.USER)
  } else {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  }
}

export function loadOrdersFromStorage(): Order[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(STORAGE_KEYS.ORDERS)
  if (!stored) {
    return []
  }
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function saveOrdersToStorage(orders: Order[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))
  try {
    window.dispatchEvent(new Event('storage'))
  } catch {}
}

export function loadAdminSettings(): AdminSettings {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_SETTINGS
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS)
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_ADMIN_SETTINGS))
    return DEFAULT_ADMIN_SETTINGS
  }
  try {
    return { ...DEFAULT_ADMIN_SETTINGS, ...JSON.parse(stored) }
  } catch {
    return DEFAULT_ADMIN_SETTINGS
  }
}

export function saveAdminSettings(settings: AdminSettings) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
  try {
    window.dispatchEvent(new Event('storage'))
  } catch {}
  try {
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    }).catch(() => {})
  } catch {}
}

export function loadCustomProducts(): Product[] {
  if (typeof window === 'undefined') return PRODUCTS
  const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
  if (!stored) return PRODUCTS
  try {
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : PRODUCTS
  } catch {
    return PRODUCTS
  }
}

export function saveCustomProducts(products: Product[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products))
  try {
    window.dispatchEvent(new Event('storage'))
  } catch {}
}

export interface CategoryItem {
  id: string
  name: string
  nameAm: string
  slug: string
  icon?: string
  description?: string
  itemCount?: number
  isActive: boolean
}

export interface EthiopianReview {
  id: string
  authorName: string
  authorLocation: string
  authorAvatar: string
  rating: number
  date: string
  verified: boolean
  isLocalGuide?: boolean
  reviewEn: string
  reviewAm: string
  bikeModel: string
  helpfulCount: number
  isFeatured: boolean
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cat-all', name: 'All', nameAm: 'ሁሉም', slug: 'all', description: 'Complete catalog of bicycles and gear', isActive: true },
  { id: 'cat-city', name: 'City bikes', nameAm: 'የከተማ ብስክሌቶች', slug: 'city-bikes', description: 'Built for daily Addis Ababa commuting and asphalt streets', isActive: true },
  { id: 'cat-mtb', name: 'Mountain bikes', nameAm: 'የተራራ ብስክሌቶች', slug: 'mountain-bikes', description: 'Conquer the steep rocky ridges of Entoto and Yeka', isActive: true },
  { id: 'cat-road', name: 'Road bikes', nameAm: 'የፍጥነት ብስክሌቶች', slug: 'road-bikes', description: 'Lightweight endurance racers for expressway speed', isActive: true },
  { id: 'cat-kids', name: 'Kids bikes', nameAm: 'የልጆች ብስክሌቶች', slug: 'kids-bikes', description: 'Safe, adjustable and durable bikes for young riders', isActive: true },
  { id: 'cat-ebike', name: 'Electric bikes', nameAm: 'ኤሌክትሪክ ብስክሌቶች', slug: 'electric-bikes', description: 'Pedal-assist power for high-altitude Addis hills', isActive: true },
  { id: 'cat-helmets', name: 'Helmets', nameAm: 'የራስ ቁር', slug: 'helmets', description: 'Certified protective headwear for traffic safety', isActive: true },
  { id: 'cat-locks', name: 'Locks & Lights', nameAm: 'መቆለፊያና መብራት', slug: 'locks-lights', description: 'Heavy-duty U-locks and ultra-bright commuter LEDs', isActive: true },
  { id: 'cat-tools', name: 'Pumps & Tools', nameAm: 'ፓምፕና እቃዎች', slug: 'pumps-tools', description: 'Puncture repair kits, floor pumps and multitools', isActive: true }
]

export const DEFAULT_ETHIOPIAN_REVIEWS: EthiopianReview[] = [
  {
    id: 'rev-01',
    authorName: 'Dawit Tefera',
    authorLocation: 'Bole Medhanialem, Addis Ababa',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: '3 days ago',
    verified: true,
    isLocalGuide: true,
    bikeModel: 'Addis Commuter 01',
    reviewEn: 'I commute every morning from Bole to Kazanchis on the Addis Commuter 01. The upright posture and wide tires handle cobblestone streets effortlessly. Payment on Telebirr was approved in under 2 minutes!',
    reviewAm: 'ከቦሌ ወደ ካዛንቺስ በየቀኑ በ አዲስ ኮሙተር 01 እጓዛለሁ። ኮብልስቶን መንገድ ላይ እጅግ ምቹ ነው። ክፍያ በቴሌብር በሁለት ደቂቃ ውስጥ ተፈጸመ!',
    helpfulCount: 24,
    isFeatured: true
  },
  {
    id: 'rev-02',
    authorName: 'Bethlehem Tilahun',
    authorLocation: 'Old Airport / Sarbet, Addis Ababa',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: '1 week ago',
    verified: true,
    isLocalGuide: true,
    bikeModel: 'Kids Trail 20 Shimano',
    reviewEn: 'Ordered a kids bike for my 8-year-old daughter. The sizing guide on this website was 100% accurate! The courier called before arriving and delivered it assembled and tuned right to our gate in Sarbet.',
    reviewAm: 'ለ8 ዓመት ልጄ የልጆች ብስክሌት አዝዤ ነበር። የሳይዝ መመሪያው በጣም ትክክለኛ ነው! ሰራተኛው ሙሉ ለሙሉ ገጣጥሞ እስከ ሳርቤት ቤታችን በር ድረስ አደረሰልን።',
    helpfulCount: 19,
    isFeatured: true
  },
  {
    id: 'rev-03',
    authorName: 'Tewodros Kassahun (Teddy)',
    authorLocation: 'Entoto / Shiro Meda, Addis Ababa',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: '2 weeks ago',
    verified: true,
    isLocalGuide: true,
    bikeModel: 'Entoto Trail S Carbon',
    reviewEn: 'Took the Entoto Trail Carbon up the steepest rocky incline behind the US Embassy past Entoto Park. The Shimano Deore 1x12 climbed gradients over 18% with zero chain slip. Absolute master engineering!',
    reviewAm: 'የዕንጦጦ ትሬል ካርቦን ብስክሌትን በዕንጦጦ ተራራ ቁልቁለትና ዳገት ሞከርኩት። ባለ 12 ማርሹ ዳገትን ያለ አንዳች ልፋት ይወጣል። በእውነት ምርጥ ጥራት!',
    helpfulCount: 38,
    isFeatured: true
  },
  {
    id: 'rev-04',
    authorName: 'Selamawit Bekele',
    authorLocation: 'CMC Michael, Addis Ababa',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: '3 weeks ago',
    verified: true,
    isLocalGuide: false,
    bikeModel: 'Knog Blinder USB Light Set',
    reviewEn: 'Super fast delivery to CMC! Riding home after 7 PM along the ring road requires powerful lights and this Knog set illuminates 50 meters ahead. Staff were courteous and gave me free installation tips.',
    reviewAm: 'ወደ ሲኤምሲ ፈጣን አቅርቦት! ምሽት ከቀኑ 1 ሰዓት በኋላ በቀለበት መንገድ ስጓዝ አስተማማኝ መብራት ወሳኝ ነበር። ሰራተኞቹም በጣም ደስ የሚል አቀባበል አድርገውልኛል።',
    helpfulCount: 15,
    isFeatured: true
  },
  {
    id: 'rev-05',
    authorName: 'Yared Mengistu',
    authorLocation: 'Piassa / Arat Kilo, Addis Ababa',
    authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: '1 month ago',
    verified: true,
    isLocalGuide: true,
    bikeModel: 'Blue Nile Aero Road',
    reviewEn: 'We do weekend peloton rides from Meskel Square all the way to Bishoftu lakes. The Blue Nile Aero is featherlight, cuts wind effortlessly, and the hydraulic disc brakes give total confidence going downhill.',
    reviewAm: 'የሳምንት መጨረሻ የቡድን ጉዞ ከመስቀል አደባባይ እስከ ቢሾፍቱ ሐይቆች እናደርጋለን። ይህ ብስክሌት እጅግ ቀላልና ፈጣን ነው። የፍሬን ጥንካሬውም ወደር የለውም።',
    helpfulCount: 42,
    isFeatured: true
  },
  {
    id: 'rev-06',
    authorName: 'Henok Girma',
    authorLocation: 'Summit / Ayat, Addis Ababa',
    authorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    date: '1 month ago',
    verified: true,
    isLocalGuide: false,
    bikeModel: 'Ride Addis Urban Helmet MIPS',
    reviewEn: 'Authentic gear with proper warranty. After trying to find reliable bike accessories across Addis markets, Ride Addis is a game changer. Paid with CBE Birr and receipt with warranty arrived instantly.',
    reviewAm: 'ዋስትና ያለው እውነተኛ ጥራት! በአዲስ አበባ ገበያዎች ውስጥ ብዙ ካፈላለግኩ በኋላ ራይድ አዲስ ተመራጭ ሆነልኝ። በሲቢኢ ብር ከፍዬ ወዲያው ደረሰኝ ተሰጠኝ።',
    helpfulCount: 29,
    isFeatured: true
  }
]

export function loadCategories(): CategoryItem[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES
  const stored = localStorage.getItem('ride_addis_categories')
  if (!stored) {
    localStorage.setItem('ride_addis_categories', JSON.stringify(DEFAULT_CATEGORIES))
    return DEFAULT_CATEGORIES
  }
  try {
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CATEGORIES
  } catch {
    return DEFAULT_CATEGORIES
  }
}

export function saveCategories(categories: CategoryItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem('ride_addis_categories', JSON.stringify(categories))
  try {
    window.dispatchEvent(new Event('storage'))
  } catch {}
}

export function loadReviews(): EthiopianReview[] {
  if (typeof window === 'undefined') return DEFAULT_ETHIOPIAN_REVIEWS
  const stored = localStorage.getItem('ride_addis_reviews')
  if (!stored) {
    localStorage.setItem('ride_addis_reviews', JSON.stringify(DEFAULT_ETHIOPIAN_REVIEWS))
    return DEFAULT_ETHIOPIAN_REVIEWS
  }
  try {
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ETHIOPIAN_REVIEWS
  } catch {
    return DEFAULT_ETHIOPIAN_REVIEWS
  }
}

export function saveReviews(reviews: EthiopianReview[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem('ride_addis_reviews', JSON.stringify(reviews))
  try {
    window.dispatchEvent(new Event('storage'))
  } catch {}
}


