export interface ProductSizeOption {
  size: 'Small' | 'Medium' | 'Large' | string
  heightCm?: string
  price: number
}

export interface Product {
  id: string
  name: string
  am: string
  category: string
  section: 'bike' | 'accessory'
  brand: string
  type: string
  price: number
  priceFormatted: string
  description: string
  amDescription: string
  images: string[]
  tone: string
  badge?: string
  sizes?: ProductSizeOption[]
  specs: {
    frame?: string
    gears?: string
    brakes?: string
    weight?: string
    wheels?: string
    recommendedHeight?: string
    warranty?: string
  }
}

export const PRODUCTS: Product[] = [
  {
    id: 'bike-01',
    name: 'Addis Commuter 01',
    am: 'አዲስ ኮሙተር 01',
    category: 'City bikes',
    section: 'bike',
    brand: 'Ride Addis',
    type: 'Step-through / 7-speed Shimano',
    price: 86500,
    priceFormatted: 'ETB 86,500',
    description: 'A calm, upright city bike for Addis Ababa mornings, daily commutes, and everyday urban freedom.',
    amDescription: 'ለአዲስ አበባ ማለዳዎች፣ ለዕለታዊ ጉዞዎች እና ለከተማ እንቅስቃሴ የተሰራ ምቹ ብስክሌት።',
    images: [
      '/hero-bike.png',
      'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=900&q=80'
    ],
    tone: '#252925',
    badge: 'Popular in Addis',
    sizes: [
      { size: 'Small', price: 83500 },
      { size: 'Medium', price: 86500 },
      { size: 'Large', price: 89500 }
    ],
    specs: {
      frame: '6061 Hydroformed Alloy',
      gears: 'Shimano Nexus 7-Speed Internal',
      brakes: 'Tektro Dual Piston Mechanical',
      weight: '12.2 kg',
      wheels: '700x38c Puncture Resistant',
      recommendedHeight: '160 - 185 cm'
    }
  },
  {
    id: 'bike-02',
    name: 'Entoto Trail S Carbon',
    am: 'እንጦጦ ትሬል S ካርቦን',
    category: 'Mountain bikes',
    section: 'bike',
    brand: 'Trek',
    type: '29er Trail / 1x12 Deore',
    price: 128000,
    priceFormatted: 'ETB 128,000',
    description: 'Engineered for rocky gradients and technical descents along the Entoto Forest ridges.',
    amDescription: 'ለዕንጦጦ ተራራ ጠጠርና ዳገታማ መንገዶች ተብሎ የተሰራ ባለ 29-ኢንች እገዳ ያለው የተራራ ብስክሌት።',
    images: [
      'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=900&q=80',
      '/hero-bike.png',
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&q=80'
    ],
    tone: '#536b45',
    badge: 'Entoto Tested',
    sizes: [
      { size: 'Small', price: 124000 },
      { size: 'Medium', price: 128000 },
      { size: 'Large', price: 132000 }
    ],
    specs: {
      frame: 'Toray T800 Carbon Monocoque',
      gears: 'Shimano Deore 1x12 Speed Rapidfire',
      brakes: 'Shimano MT200 Hydraulic Disc 180mm',
      weight: '11.4 kg',
      wheels: '29" Maxxis Ardent 2.4" Tubeless',
      recommendedHeight: '168 - 188 cm'
    }
  },
  {
    id: 'bike-03',
    name: 'Blue Nile Aero Road',
    am: 'ሰማያዊ ናይል ኤሮ ሮድ',
    category: 'Road bikes',
    section: 'bike',
    brand: 'Specialized',
    type: 'Full Carbon Monocoque / 2x11',
    price: 214000,
    priceFormatted: 'ETB 214,000',
    description: 'Precision endurance road machine built for high-speed weekend pacelines towards Bishoftu crater lakes.',
    amDescription: 'ከአዲስ አበባ እስከ ቢሾፍቱ ሐይቆች ለሚደረጉ የሳምንት መጨረሻ የፍጥነት ጉዞዎች የተዘጋጀ የካርቦን ብስክሌት።',
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=900&q=80',
      '/hero-bike.png',
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=900&q=80'
    ],
    tone: '#435e72',
    badge: 'Pro Tier',
    sizes: [
      { size: 'Small', price: 208000 },
      { size: 'Medium', price: 214000 },
      { size: 'Large', price: 219000 }
    ],
    specs: {
      frame: 'FACT 10r Carbon Aerofoil',
      gears: 'Shimano 105 R7000 22-Speed',
      brakes: 'Shimano 105 Hydraulic Flat-Mount',
      weight: '8.2 kg',
      wheels: '700x28c Continental Grand Prix',
      recommendedHeight: '170 - 192 cm'
    }
  },
  {
    id: 'bike-04',
    name: 'Lalibela Mini 20"',
    am: 'ላሊበላ ሚኒ 20-ኢንች',
    category: 'Kids bikes',
    section: 'bike',
    brand: 'Ride Addis',
    type: '20 inch / Ages 6-9 / Lightweight',
    price: 42500,
    priceFormatted: 'ETB 42,500',
    description: 'Easy handling, lightweight aluminum frame, safety chain-guard, and confidence-inspiring brakes for kids.',
    amDescription: 'ለህፃናት ቀላል አያያዝ፣ ጠንካራ ዊልስ እና ደህንነቱ የተጠበቀ የፍሬን ስርዓት ያለው የልጆች ብስክሌት።',
    images: [
      'https://images.unsplash.com/photo-1511994298241-608e28f14fde?auto=format&fit=crop&w=900&q=80',
      '/hero-bike.png'
    ],
    tone: '#92754a',
    badge: 'Ages 6-9',
    sizes: [
      { size: 'Small', price: 42500 }
    ],
    specs: {
      frame: 'Featherlight 6061 Heat-Treated Aluminum',
      gears: 'Shimano Tourney 6-Speed Twist Shift',
      brakes: 'Short-reach Junior Alloy V-Brakes',
      weight: '8.6 kg',
      wheels: '20" Kenda Small Block Junior',
      recommendedHeight: '115 - 135 cm'
    }
  },
  {
    id: 'bike-05',
    name: 'Menelik Hybrid Urban',
    am: 'ምኒልክ ሃይብሪድ የከተማ',
    category: 'Men’s bikes',
    section: 'bike',
    brand: 'Giant',
    type: 'All-Terrain Hybrid / 24 Speed',
    price: 98000,
    priceFormatted: 'ETB 98,000',
    description: 'Versatile everyday companion with front suspension lockout and rugged mixed-pavement capability.',
    amDescription: 'በአዲስ አበባ የተለያዩ መንገዶች ላይ ለሚደረግ ጉዞ ፍጹም ተስማሚ ዘመናዊ ሃይብሪድ ብስክሌት።',
    images: [
      'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=900&q=80'
    ],
    tone: '#384553',
    badge: 'Versatile',
    sizes: [
      { size: 'Small', price: 94500 },
      { size: 'Medium', price: 98000 },
      { size: 'Large', price: 101500 }
    ],
    specs: {
      frame: 'ALUXX Grade Aluminum',
      gears: 'Shimano Acera 3x8 Speed',
      brakes: 'Tektro Hydraulic Disc Brakes',
      weight: '12.8 kg',
      wheels: '700x40c Crosscut Anti-Flat',
      recommendedHeight: '165 - 188 cm'
    }
  },
  {
    id: 'bike-06',
    name: 'Sheger Heavy-Duty Cargo',
    am: 'ሸገር ካርጎ ከባድ ጭነት',
    category: 'Utility bikes',
    section: 'bike',
    brand: 'Giant',
    type: 'Reinforced Longtail / 180kg Capacity',
    price: 119000,
    priceFormatted: 'ETB 119,000',
    description: 'Carry market goods, groceries, parcels, and children without sacrificing riding stability.',
    amDescription: 'ሸቀጦችንና እቃዎችን በቀላሉ ለመጫን የተጠናከረ የፍሬም መዋቅር ያለው የጭነት ብስክሌት።',
    images: [
      'https://images.unsplash.com/photo-1559348349-86f1f65817fe?auto=format&fit=crop&w=900&q=80',
      '/hero-bike.png'
    ],
    tone: '#5d5749',
    badge: 'Heavy Duty',
    sizes: [
      { size: 'Medium', price: 119000 },
      { size: 'Large', price: 125000 }
    ],
    specs: {
      frame: 'Reinforced Chromoly Longtail Platform',
      gears: 'Shimano Alivio 9-Speed Wide Range',
      brakes: 'Quad-Piston 203mm Cargo Disc Brakes',
      weight: '21.5 kg',
      wheels: '26"x2.3" Heavy Duty Double Wall 48-Spoke',
      recommendedHeight: '155 - 195 cm'
    }
  },
  {
    id: 'bike-07',
    name: 'Abyssinia Volt E-Trail 750W',
    am: 'አቢሲኒያ ቮልት ኤሌክትሪክ 750 ዋት',
    category: 'Electric bikes',
    section: 'bike',
    brand: 'Ride Addis',
    type: 'Mid-Drive Electric / 100km Range',
    price: 185000,
    priceFormatted: 'ETB 185,000',
    description: 'Effortlessly conquer the steepest hills of Addis with intelligent torque sensing and Samsung battery cells.',
    amDescription: 'የአዲስ አበባን ዳገቶች በቀላሉ ለመውጣት የሚያስችል 750 ዋት ኃይለኛ ሞተር ያለው ዘመናዊ ኤሌክትሪክ ብስክሌት።',
    images: [
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=900&q=80'
    ],
    tone: '#2e3a35',
    badge: 'Electric Power',
    sizes: [
      { size: 'Small', price: 179000 },
      { size: 'Medium', price: 185000 },
      { size: 'Large', price: 191000 }
    ],
    specs: {
      frame: 'Integrated Battery Aircraft Alloy',
      gears: 'Bafang 750W + Shimano CUES 9-Speed',
      brakes: 'Hydraulic Quad-Piston with Cutoff Switch',
      weight: '23.8 kg',
      wheels: '27.5"x2.4" E-Bike Shield',
      recommendedHeight: '162 - 190 cm'
    }
  },
  {
    id: 'bike-08',
    name: 'Omo Gravel Explorer',
    am: 'ኦሞ ግራቭል ኤክስፕሎረር',
    category: 'Road bikes',
    section: 'bike',
    brand: 'Cannondale',
    type: 'Gravel & All-Road / GRX 1x11',
    price: 165000,
    priceFormatted: 'ETB 165,000',
    description: 'Wide tire clearance and gravel geometry for transitioning from asphalt highways to country dirt roads.',
    amDescription: 'ከአስፋልት እስከ ጠጠር ገጠር መንገዶች ድረስ ያለምንም እንከን የሚጓዝ ዘመናዊ ግራቭል ብስክሌት።',
    images: [
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=900&q=80',
      '/hero-bike.png'
    ],
    tone: '#3f4e45',
    badge: 'Gravel Series',
    sizes: [
      { size: 'Small', price: 159000 },
      { size: 'Medium', price: 165000 },
      { size: 'Large', price: 171000 }
    ],
    specs: {
      frame: 'SmartForm C2 Alloy with Full Carbon Fork',
      gears: 'Shimano GRX 600 1x11 Speed',
      brakes: 'Shimano GRX Hydraulic Disc Flat-Mount',
      weight: '9.8 kg',
      wheels: '700x42c WTB Riddler Tubeless Ready',
      recommendedHeight: '168 - 188 cm'
    }
  },
  // ACCESSORIES (CycleSouq Style)
  {
    id: 'acc-01',
    name: 'ABUS Urban AirBreaker MIPS Helmet',
    am: 'አቡስ ኤርብሬከር MIPS ቆብ',
    category: 'Helmets',
    section: 'accessory',
    brand: 'Abus',
    type: 'MIPS Safety / Forced Air Cooling',
    price: 18500,
    priceFormatted: 'ETB 18,500',
    description: 'Pro peloton aerodynamic ventilation with integrated MIPS rotational impact brain protection.',
    amDescription: 'ለራስ ቅል ከፍተኛ ደህንነት የሚሰጥ ዓለም አቀፍ ደረጃውን የጠበቀ የብስክሌተኞች ቆብ።',
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=900&q=80'
    ],
    tone: '#3b3b3b',
    badge: 'MIPS Certified',
    specs: {
      weight: '240 grams',
      warranty: '2 Year ABUS Crash Replacement'
    }
  },
  {
    id: 'acc-02',
    name: 'Ride Addis 1200L High-Lumen Lightset',
    am: 'አዲስ 1200L ኃይለኛ መብራት',
    category: 'Locks & Lights',
    section: 'accessory',
    brand: 'Ride Addis',
    type: 'USB-C Rechargeable / Waterproof IPX6',
    price: 7800,
    priceFormatted: 'ETB 7,800',
    description: 'Cut through unlit Addis streets with 1,200 lumens front beam and smart brake-sensing rear strobe.',
    amDescription: 'ለጨለማ የአዲስ አበባ መንገዶች እጅግ ደማቅ ብርሃን የሚሰጥና በUSB የሚሞላ ጥራት ያለው መብራት።',
    images: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1511994298241-608e28f14fde?auto=format&fit=crop&w=900&q=80'
    ],
    tone: '#282d29',
    badge: 'Night Rider',
    specs: {
      weight: '145 grams',
      warranty: '12 Month Replacement'
    }
  },
  {
    id: 'acc-03',
    name: 'Knog 14mm Hardened Steel U-Lock',
    am: 'ኖግ 14ሚሜ ጠንካራ ብረት መቆለፊያ',
    category: 'Locks & Lights',
    section: 'accessory',
    brand: 'Knog',
    type: 'Anti-Cut / Dual Bolt Deadlock',
    price: 9400,
    priceFormatted: 'ETB 9,400',
    description: 'Gold Sold-Secure certified steel lock resistant to angle grinders and hydraulic cutters.',
    amDescription: 'ብስክሌትዎን ከስርቆት የሚጠብቅ ጠንካራ የብረት ዩ-መቆለፊያ።',
    images: [
      'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=900&q=80',
      '/hero-bike.png'
    ],
    tone: '#333835',
    badge: 'Gold Security',
    specs: {
      weight: '1.2 kg',
      warranty: 'Lifetime Mechanism Cover'
    }
  },
  {
    id: 'acc-04',
    name: 'Bontrager Dual-Valve Track Floor Pump',
    am: 'ቦንትሬገር የመሬት ፓምፕ',
    category: 'Pumps & Tools',
    section: 'accessory',
    brand: 'Trek',
    type: '160 PSI / Auto Presta & Schrader',
    price: 8900,
    priceFormatted: 'ETB 8,900',
    description: 'Precision steel barrel with oversized analog pressure gauge for road and mountain tires.',
    amDescription: 'እስከ 160 PSI የጎማ ንፋስ መሙላት የሚችል ትክክለኛ መለኪያ ያለው ፓምፕ።',
    images: [
      'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&q=80'
    ],
    tone: '#2e332f',
    badge: 'Workshop Grade',
    specs: {
      weight: '1.6 kg',
      warranty: '3 Year Bontrager Warranty'
    }
  }
]

export const ALL_CATEGORIES = [
  'All',
  'City bikes',
  'Mountain bikes',
  'Road bikes',
  'Kids bikes',
  'Electric bikes',
  'Helmets',
  'Locks & Lights',
  'Pumps & Tools'
]

export const ALL_BRANDS = [
  'All brands',
  'Ride Addis',
  'Trek',
  'Giant',
  'Specialized',
  'Cannondale',
  'Abus',
  'Knog'
]
