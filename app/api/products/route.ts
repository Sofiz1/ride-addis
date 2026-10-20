import { NextRequest, NextResponse } from 'next/server'
import { DB } from '@/lib/db'
import { Product } from '@/lib/catalog'

export async function GET() {
  try {
    const products = DB.getProducts()
    return NextResponse.json({ success: true, data: products })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const products = DB.getProducts()
    
    // Validate required fields
    if (!body.name || !body.price) {
      return NextResponse.json({ success: false, error: 'Product name and price are required' }, { status: 400 })
    }

    const newProduct: Product = {
      id: body.id || 'bike-' + Date.now(),
      name: body.name,
      am: body.am || body.name,
      category: body.category || 'City bikes',
      section: body.section || 'bike',
      brand: body.brand || 'Ride Addis',
      type: body.type || 'Shimano 7-Speed',
      price: Number(body.price),
      priceFormatted: `ETB ${Number(body.price).toLocaleString()}`,
      description: body.description || '',
      amDescription: body.amDescription || body.description || '',
      images: body.images && body.images.length > 0 ? body.images : ['/hero-bike.png'],
      tone: body.tone || '#252925',
      badge: body.badge,
      sizes: body.sizes || undefined,
      specs: body.specs || {
        frame: 'Alloy 6061',
        gears: 'Shimano Tourney/Deore',
        brakes: 'Disc Brakes',
        weight: '12 kg'
      }
    }

    const updated = [newProduct, ...products]
    DB.saveProducts(updated)
    return NextResponse.json({ success: true, data: newProduct })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 })
    }

    const products = DB.getProducts()
    const index = products.findIndex(p => p.id === body.id)
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    const updatedProduct = {
      ...products[index],
      ...body,
      price: Number(body.price || products[index].price),
      priceFormatted: `ETB ${Number(body.price || products[index].price).toLocaleString()}`
    }

    products[index] = updatedProduct
    DB.saveProducts(products)
    return NextResponse.json({ success: true, data: updatedProduct })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 })
    }

    const products = DB.getProducts()
    const filtered = products.filter(p => p.id !== id)
    DB.saveProducts(filtered)
    return NextResponse.json({ success: true, message: 'Product deleted' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
