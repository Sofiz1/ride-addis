import fs from 'fs'
import path from 'path'
import { Product, PRODUCTS, ALL_CATEGORIES, ALL_BRANDS } from './catalog'
import { Order, AdminSettings, DEFAULT_ADMIN_SETTINGS, UserProfile } from './store'

// Data directory for persistent storage on YegaraHost or local server
const DATA_DIR = path.join(process.cwd(), 'data')

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

export const INITIAL_CATEGORIES: CategoryItem[] = [
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

export const INITIAL_ETHIOPIAN_REVIEWS: EthiopianReview[] = [
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

// Server-side helper to ensure data directory exists
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
  } catch (err) {
    console.error('Error ensuring data/uploads directories:', err)
  }
}

function readJsonFile<T>(filename: string, defaultValue: T): T {
  ensureDataDir()
  const filePath = path.join(DATA_DIR, filename)
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(data) as T
    }
    // Write default value if file does not exist
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8')
    return defaultValue
  } catch (err) {
    console.error(`Error reading ${filename}:`, err)
    return defaultValue
  }
}

function writeJsonFile<T>(filename: string, data: T): boolean {
  ensureDataDir()
  const filePath = path.join(DATA_DIR, filename)
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (err) {
    console.error(`Error writing ${filename}:`, err)
    return false
  }
}

// Database Operations
export const DB = {
  getProducts: (): Product[] => readJsonFile<Product[]>('products.json', PRODUCTS),
  saveProducts: (products: Product[]) => writeJsonFile('products.json', products),

  getCategories: (): CategoryItem[] => readJsonFile<CategoryItem[]>('categories.json', INITIAL_CATEGORIES),
  saveCategories: (categories: CategoryItem[]) => writeJsonFile('categories.json', categories),

  getReviews: (): EthiopianReview[] => readJsonFile<EthiopianReview[]>('reviews.json', INITIAL_ETHIOPIAN_REVIEWS),
  saveReviews: (reviews: EthiopianReview[]) => writeJsonFile('reviews.json', reviews),

  getOrders: (): Order[] => readJsonFile<Order[]>('orders.json', []),
  saveOrders: (orders: Order[]) => writeJsonFile('orders.json', orders),

  getSettings: (): AdminSettings => readJsonFile<AdminSettings>('settings.json', DEFAULT_ADMIN_SETTINGS),
  saveSettings: (settings: AdminSettings) => writeJsonFile('settings.json', settings),

  getUsers: (): UserProfile[] => readJsonFile<UserProfile[]>('users.json', []),
  saveUsers: (users: UserProfile[]) => writeJsonFile('users.json', users)
}
