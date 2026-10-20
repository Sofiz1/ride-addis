import { NextResponse } from 'next/server'
import { DB } from '@/lib/db'

const API_KEY = process.env.GEMINI_API_KEY || ''

function stripEmojis(str: string): string {
  return str.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F1E6}-\u{1F1FF}]/gu, '').trim()
}

// Default catalog fallback
const DEFAULT_CATALOG = [
  { name: 'Lalibela Mini 20', price: 42500, priceFormatted: 'ETB 42,500', category: 'Kids bikes', type: 'Junior 20-inch alloy' },
  { name: 'Mercato Heavy Hauler Cargo', price: 64000, priceFormatted: 'ETB 64,000', category: 'Cargo bikes', type: 'Reinforced chromoly steel' },
  { name: 'Addis Commuter 01', price: 86500, priceFormatted: 'ETB 86,500', category: 'City bikes', type: '7-speed Shimano internal hub' },
  { name: 'Entoto Trail S Carbon 29er', price: 128000, priceFormatted: 'ETB 128,000', category: 'Mountain bikes', type: '1x12 Deore hydraulic disc' },
  { name: 'Bishoftu Speed Pro Aero', price: 145000, priceFormatted: 'ETB 145,000', category: 'Road bikes', type: 'Carbon monocoque Shimano 105' },
  { name: 'Rift Valley Electric Trail E-Bike', price: 195000, priceFormatted: 'ETB 195,000', category: 'Electric bikes', type: '250W Bosch mid-drive 85Nm' }
]

export async function POST(req: Request) {
  // Read live store settings dynamically
  let telebirrNum = '0966245048'
  let telebirrName = 'Fraol Woldekidan'
  let cbebirrNum = '0966245048'
  let cbebirrName = 'Fraol Woldekidan'
  let cbeAcc = '1000359050047'
  let cbeName = 'Fraol Woldekidan'
  let cbeBranch = 'Commercial Bank of Ethiopia (CBE)'
  try {
    const liveSettings = DB.getSettings()
    if (liveSettings) {
      telebirrNum = liveSettings.telebirrPhone || liveSettings.telebirrMerchantCode || telebirrNum
      telebirrName = liveSettings.telebirrMerchantName || telebirrName
      cbebirrNum = liveSettings.cbebirrPhone || liveSettings.telebirrPhone || cbebirrNum
      cbebirrName = liveSettings.cbebirrName || liveSettings.telebirrMerchantName || cbebirrName
      cbeAcc = liveSettings.cbeAccountNumber || cbeAcc
      cbeName = liveSettings.cbeAccountName || cbeName
      cbeBranch = liveSettings.cbeBankBranch || cbeBranch
    }
  } catch {}

  try {
    const { message, history, products } = await req.json()
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const q = message.toLowerCase().trim()
    const activeList = (Array.isArray(products) && products.length > 0) ? products : DEFAULT_CATALOG

    const getPriceStr = (item: any) =>
      item.priceFormatted || (item.price ? `ETB ${Number(item.price).toLocaleString()}` : 'ETB 86,500')

    // Build dynamic catalog text for AI prompt
    let catalogInventoryText = activeList
      .map((p: any, idx: number) => {
        const price = getPriceStr(p)
        const category = p.category || 'Bicycle'
        const type = p.type || ''
        const desc = p.description || ''
        const specs = p.specs
          ? `Frame: ${p.specs.frame || 'Alloy'}, Gears: ${p.specs.gears || 'Multi-speed'}, Brakes: ${p.specs.brakes || 'Disc'}`
          : ''
        return `${idx + 1}. ${p.name} (Price: ${price}) - Category: ${category}, Type: ${type}. ${desc} [Specs: ${specs}]`
      })
      .join('\n')

    const systemInstruction = `You are Ride Addis AI, the premier cycling advisor, mechanic specialist, and customer assistant in Addis Ababa, Ethiopia.
CRITICAL INSTRUCTIONS:
1. ALWAYS ANSWER EVERY QUESTION the user asks directly, helpfully, and thoroughly. Never decline to answer. Whether the user asks about bikes, mechanics, maintenance, riding techniques, hills, Entoto climbing, Addis Ababa weather/mud/traffic, prices, payments, delivery, health, general advice, or casual greetings, provide a smart, friendly, and complete answer.
2. NEVER mention Gemini, Google, or any AI platform under any circumstances. You are strictly Ride Addis AI.
3. NEVER mention Bole or any specific neighborhood as our sole location. Our location is strictly Addis Ababa, Ethiopia, serving all areas with doorstep delivery.
4. STRICTLY NO EMOJIS OR SYMBOLS under any circumstances. Keep output strictly clean plain text.
5. MONEY & PRICING: All prices are in Ethiopian Birr (ETB). Our bicycle prices range from ETB 42,500 to ETB 195,000. Quote exact ETB prices from the catalog whenever asked.
6. Payments: Telebirr (Phone number: ${telebirrNum}, Account Name: ${telebirrName}), CBEBirr (Phone number: ${cbebirrNum}, Account Name: ${cbebirrName}), and Commercial Bank of Ethiopia (CBE Bank Account: ${cbeAcc}, Account Name: ${cbeName}, Branch: ${cbeBranch}). Cash on Delivery is also accepted across Addis Ababa.
7. Delivery & Assembly: Free doorstep delivery across Addis Ababa on all orders over ETB 50,000. All bicycles are 100% assembled and calibrated by certified Addis Ababa mechanics.

LIVE STORE CATALOG & EXACT ETB PRICES:
${catalogInventoryText}`

    // Prepare conversation history
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = []
    if (Array.isArray(history)) {
      for (const h of history.slice(-6)) {
        if (h.sender === 'user' && h.text) contents.push({ role: 'user', parts: [{ text: h.text }] })
        else if (h.sender === 'ai' && h.text) contents.push({ role: 'model', parts: [{ text: h.text }] })
      }
    }
    contents.push({ role: 'user', parts: [{ text: message }] })

    // Models to try: gemini-3.5-flash-lite is fastest (1.2s), fallback to gemini-3.5-flash
    const modelsToTry = ['gemini-3.5-flash-lite', 'gemini-3.5-flash']

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(7500),
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents,
            generationConfig: { temperature: 0.35, maxOutputTokens: 500 }
          })
        })

        if (res.ok) {
          const data = await res.json()
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) {
            const clean = stripEmojis(text)
              .replace(/gemini/gi, 'Ride Addis')
              .replace(/google/gi, 'Ride Addis')
              .replace(/bole/gi, 'Addis Ababa')
            return NextResponse.json({ reply: clean })
          }
        }
      } catch {
        // Continue to fallback model
      }
    }

    // Comprehensive Local Fallback Engine if network latency occurs
    // Guarantees an intelligent, detailed response to ANY question
    let fallback = ""

    // 1. Payment Methods
    if (q.includes('telebirr') || q.includes('cbe') || q.includes('how to pay') || q.includes('payment') || q.includes('bank') || q.includes('transfer') || q.includes('account')) {
      fallback = `We accept Telebirr (Phone: ${telebirrNum}, Name: ${telebirrName}), CBEBirr (Phone: ${cbebirrNum}, Name: ${cbebirrName}), and Commercial Bank of Ethiopia CBE Bank Account (${cbeAcc}, Name: ${cbeName}, Branch: ${cbeBranch}). Transfer via your mobile app, enter your transaction reference number at checkout for instant verification, and your order will be prepared. Cash on Delivery is also available. Free delivery on orders over ETB 50,000.`
    }
    // 2. Pricing, Money, Budget, Costs
    else if (q.includes('price') || q.includes('cost') || q.includes('how much') || q.includes('birr') || q.includes('etb') || q.includes('money') || q.includes('cheap') || q.includes('expensive') || q.includes('budget') || q.includes('ዋጋ')) {
      if (q.includes('cheap') || q.includes('lowest') || q.includes('affordable')) {
        const sorted = [...activeList].sort((a: any, b: any) => (Number(a.price) || 0) - (Number(b.price) || 0))
        const cheapest = sorted[0] || DEFAULT_CATALOG[0]
        const adultCheapest = sorted.find((p: any) => !p.category.toLowerCase().includes('kid')) || DEFAULT_CATALOG[1]
        fallback = `Our most affordable model is the ${cheapest.name} at ${getPriceStr(cheapest)} (${cheapest.category}). For adults, our most accessible model is the ${adultCheapest.name} at ${getPriceStr(adultCheapest)}. Both include certified Addis tuning and free assembly.`
      } else if (q.includes('expensive') || q.includes('highest') || q.includes('top') || q.includes('premium')) {
        const sorted = [...activeList].sort((a: any, b: any) => (Number(b.price) || 0) - (Number(a.price) || 0))
        const highest = sorted[0] || DEFAULT_CATALOG[5]
        fallback = `Our flagship model is the ${highest.name} at ${getPriceStr(highest)} (${highest.type || highest.category}). Engineered for steep Entoto climbs with peak torque and premium components.`
      } else {
        const summary = activeList.slice(0, 6).map((p: any) => `- ${p.name}: ${getPriceStr(p)}`).join('\n')
        fallback = `Our bicycle prices in Ethiopian Birr (ETB) range from ETB 42,500 to ETB 195,000:\n${summary}\n\nAll orders over ETB 50,000 include free delivery across Addis Ababa with certified assembly.`
      }
    }
    // 3. Maintenance, Cleaning, Chains, Punctures, Repair
    else if (q.includes('chain') || q.includes('lube') || q.includes('mud') || q.includes('clean') || q.includes('maintenance') || q.includes('puncture') || q.includes('flat') || q.includes('tire') || q.includes('brake') || q.includes('gear') || q.includes('repair') || q.includes('oil')) {
      fallback = "For Addis Ababa riding, especially in rainy or muddy conditions: 1) Wash mud off your chain before it dries using water and a brush; 2) Apply a durable wet lubricant to repel water and grime; 3) Wipe off excess lube to prevent dirt buildup; 4) Keep tire pressure at 40-50 PSI for city asphalt or 30-35 PSI for Entoto gravel to prevent pinch flats. All Ride Addis bicycles come tuned with puncture-resistant tires and certified components."
    }
    // 4. Entoto, Hills, Climbing, Altitude
    else if (q.includes('entoto') || q.includes('climb') || q.includes('mountain') || q.includes('hill') || q.includes('trail') || q.includes('altitude') || q.includes('elevation')) {
      fallback = "Addis Ababa sits at 2,355 meters elevation, and climbs up Entoto reach over 3,000 meters. For off-road trails and steep ascents, the Entoto Trail S Carbon 29er (ETB 128,000) features a 1x12 Deore wide-range drivetrain and hydraulic disc brakes. For effortless hill climbing, the Rift Valley Electric Trail E-Bike (ETB 195,000) provides 85Nm torque to conquer any gradient."
    }
    // 5. City Commuting, Work, Traffic
    else if (q.includes('commute') || q.includes('city') || q.includes('daily') || q.includes('traffic') || q.includes('work') || q.includes('road')) {
      fallback = "For daily commutes through Addis Ababa traffic, the Addis Commuter 01 (ETB 86,500) is built with an internal 7-speed Shimano hub, upright posture, and puncture-resistant tires. For high-speed asphalt riding and open roads toward Bishoftu, the Bishoftu Speed Pro Aero (ETB 145,000) offers aerodynamic carbon construction."
    }
    // 6. Kids, Children, Family, Sizing
    else if (q.includes('kid') || q.includes('child') || q.includes('son') || q.includes('daughter') || q.includes('size') || q.includes('sizing') || q.includes('height') || q.includes('age')) {
      fallback = "For young riders aged 6 to 9, the Lalibela Mini 20 (ETB 42,500) features an ultra-lightweight frame and junior-reach safety levers. For sizing adult riders, wheel diameters of 27.5-inch or 29-inch match heights from 160cm to 195cm. You can also run our Find My Bike sizing studio on our homepage for an instant recommendation."
    }
    // 7. Delivery, Shipping, Assembly, Location
    else if (q.includes('delivery') || q.includes('deliver') || q.includes('ship') || q.includes('where') || q.includes('location') || q.includes('address')) {
      fallback = "Ride Addis is located in Addis Ababa, Ethiopia. We provide doorstep delivery across the entire capital, with 100% free delivery on all orders over ETB 50,000. Every bicycle arrives fully assembled and calibrated by certified Addis mechanics, ready to ride immediately."
    }
    // 8. Greetings & General Conversational Queries
    else if (q.includes('hi') || q.includes('hello') || q.includes('selam') || q.includes('hey') || q.includes('good') || q.includes('who are you') || q.includes('help')) {
      fallback = `Selam! I am Ride Addis AI, your dedicated cycling advisor in Addis Ababa. I can answer any questions you have about our bicycles, trail recommendations up Entoto, cycling mechanics, prices in ETB, delivery, or mobile payments with Telebirr (${telebirrNum}) and CBE (${cbeAcc}) under ${telebirrName}. What would you like to know?`
    }
    // 9. Specific Product Matching
    else {
      const matched = activeList.find((p: any) => {
        const name = (p.name || '').toLowerCase()
        const cat = (p.category || '').toLowerCase()
        return q.includes(name) || name.split(' ').some((w: string) => w.length > 3 && q.includes(w)) || (q.includes(cat) && cat !== 'all')
      })
      if (matched) {
        fallback = `The ${matched.name} is priced at ${getPriceStr(matched)} (${matched.category || 'Bicycle'}). ${matched.description || ''} It is calibrated specifically for Addis Ababa elevation and comes with free doorstep delivery.`
      } else {
        fallback = `Ride Addis specializes in Road, Mountain, City, Kids, Cargo, and Electric bicycles built for Addis Ababa with prices from ETB 42,500 to ETB 195,000. I am here to help with any bicycle advice, maintenance tips, trail recommendations, pricing, delivery, or Telebirr and CBE payment questions. Feel free to ask anything!`
      }
    }

    return NextResponse.json({ reply: fallback })
  } catch {
    return NextResponse.json({
      reply: `Selam! Ride Addis provides bicycles from ETB 42,500 to ETB 195,000 tailored for Addis Ababa terrain. We accept Telebirr (${telebirrNum}), CBEBirr (${cbebirrNum}), and CBE Account (${cbeAcc}) under ${telebirrName}, with free delivery over ETB 50,000. Ask me any cycling, price, or maintenance question!`
    })
  }
}
