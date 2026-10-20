import { NextRequest, NextResponse } from 'next/server'
import { DB, EthiopianReview } from '@/lib/db'

export async function GET() {
  try {
    const reviews = DB.getReviews()
    return NextResponse.json({ success: true, data: reviews })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.authorName || !body.reviewEn) {
      return NextResponse.json({ success: false, error: 'Author name and review are required' }, { status: 400 })
    }

    const reviews = DB.getReviews()
    const newReview: EthiopianReview = {
      id: 'rev-' + Date.now(),
      authorName: body.authorName,
      authorLocation: body.authorLocation || 'Addis Ababa, Ethiopia',
      authorAvatar: '',
      rating: Number(body.rating) || 5,
      date: 'Just now',
      verified: true,
      isLocalGuide: Boolean(body.isLocalGuide),
      bikeModel: body.bikeModel || 'Addis Commuter 01',
      reviewEn: body.reviewEn,
      reviewAm: body.reviewAm || body.reviewEn,
      helpfulCount: 0,
      isFeatured: body.isFeatured !== undefined ? body.isFeatured : true
    }

    const updated = [newReview, ...reviews]
    DB.saveReviews(updated)
    return NextResponse.json({ success: true, data: newReview })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Review ID required' }, { status: 400 })
    }

    const reviews = DB.getReviews()
    const index = reviews.findIndex(r => r.id === body.id)
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 })
    }

    const updatedReview = {
      ...reviews[index],
      ...body
    }

    reviews[index] = updatedReview
    DB.saveReviews(reviews)
    return NextResponse.json({ success: true, data: updatedReview })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'Review ID required' }, { status: 400 })
    }

    const reviews = DB.getReviews()
    const filtered = reviews.filter(r => r.id !== id)
    DB.saveReviews(filtered)
    return NextResponse.json({ success: true, message: 'Review deleted' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
