import { NextRequest, NextResponse } from 'next/server'
import { DB } from '@/lib/db'
import { Order } from '@/lib/store'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || searchParams.get('id') || searchParams.get('phone')
    const orders = DB.getOrders()

    if (search) {
      const q = search.trim().toLowerCase()
      const cleanPhone = q.replace(/[^0-9]/g, '')
      const matched = orders.filter(o => {
        const idMatch = o.id.toLowerCase() === q || o.id.toLowerCase().replace(/[^a-z0-9]/g, '') === q.replace(/[^a-z0-9]/g, '')
        const phoneMatch = cleanPhone.length > 5 && (o.shippingAddress?.phone || '').replace(/[^0-9]/g, '').includes(cleanPhone)
        const refMatch = o.transactionRef && o.transactionRef.toLowerCase() === q
        return idMatch || phoneMatch || refMatch
      })
      return NextResponse.json({ success: true, data: matched })
    }

    return NextResponse.json({ success: true, data: orders })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ success: false, error: 'Order must contain items' }, { status: 400 })
    }

    const orders = DB.getOrders()
    const newOrder: Order = {
      id: body.id || 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      date: body.date || new Date().toISOString(),
      items: body.items,
      total: body.total,
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod || 'telebirr',
      paymentStatus: body.paymentStatus || 'pending_approval',
      transactionRef: body.transactionRef || '',
      status: 'confirmed',
      statusStep: 1,
      eta: 'Today within 3-4 hours (Addis Ababa Express)',
      courierName: 'Addis Courier Fleet #4',
      courierPhone: '+251 91 198 7654'
    }

    const updated = [newOrder, ...orders]
    DB.saveOrders(updated)
    return NextResponse.json({ success: true, data: newOrder })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 })
    }

    const orders = DB.getOrders()
    const index = orders.findIndex(o => o.id === body.id)
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    orders[index] = {
      ...orders[index],
      ...body
    }

    DB.saveOrders(orders)
    return NextResponse.json({ success: true, data: orders[index] })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
