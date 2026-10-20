import { NextRequest, NextResponse } from 'next/server'
import { DB } from '@/lib/db'
import { UserProfile, normalizeEthiopianPhone } from '@/lib/store'

export async function GET() {
  try {
    const rawUsers = DB.getUsers()
    const orders = DB.getOrders()

    const enrichedUsers = rawUsers.map((user) => {
      const userPhoneNorm = normalizeEthiopianPhone(user.phone)
      const userOrders = orders.filter((o) => {
        const orderEmail = (o.shippingAddress?.recipient || '').toLowerCase()
        const orderPhoneNorm = normalizeEthiopianPhone(o.shippingAddress?.phone || '')
        return (
          (user.email && o.shippingAddress?.phone && orderPhoneNorm === userPhoneNorm) ||
          (user.name && o.shippingAddress?.recipient && o.shippingAddress.recipient.toLowerCase().includes(user.name.toLowerCase()))
        )
      })

      const totalSpent = userOrders.reduce((acc, o) => acc + (o.total || 0), 0)
      const lastOrder = userOrders.length > 0 ? userOrders[userOrders.length - 1] : null

      const { passwordHash, ...safeUser } = user

      return {
        ...safeUser,
        ordersCount: userOrders.length,
        totalSpent,
        lastOrderDate: lastOrder ? lastOrder.date : null
      }
    })

    return NextResponse.json({
      success: true,
      users: enrichedUsers,
      total: enrichedUsers.length
    })
  } catch (error: any) {
    console.error('Error fetching registered users:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 })
    }

    const users = DB.getUsers()
    const filtered = users.filter((u) => u.id !== userId)

    if (filtered.length === users.length) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    DB.saveUsers(filtered)
    return NextResponse.json({ success: true, message: 'User deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
