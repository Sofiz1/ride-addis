import { NextRequest, NextResponse } from 'next/server'
import { DB, CategoryItem } from '@/lib/db'

export async function GET() {
  try {
    const categories = DB.getCategories()
    const products = DB.getProducts()
    
    // Calculate live item counts per category
    const categoriesWithCount = categories.map(cat => {
      if (cat.name === 'All') {
        return { ...cat, itemCount: products.length }
      }
      const count = products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length
      return { ...cat, itemCount: count }
    })

    return NextResponse.json({ success: true, data: categoriesWithCount })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.name) {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 })
    }

    const categories = DB.getCategories()
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    
    // Check if duplicate
    if (categories.some(c => c.name.toLowerCase() === body.name.toLowerCase())) {
      return NextResponse.json({ success: false, error: 'Category with this name already exists' }, { status: 400 })
    }

    const newCategory: CategoryItem = {
      id: 'cat-' + Date.now(),
      name: body.name,
      nameAm: body.nameAm || body.name,
      slug,
      icon: body.icon || '',
      description: body.description || '',
      itemCount: 0,
      isActive: body.isActive !== undefined ? body.isActive : true
    }

    const updated = [...categories, newCategory]
    DB.saveCategories(updated)
    return NextResponse.json({ success: true, data: newCategory })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'Category ID required' }, { status: 400 })
    }

    const categories = DB.getCategories()
    const index = categories.findIndex(c => c.id === body.id)
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 })
    }

    const updatedCategory = {
      ...categories[index],
      ...body
    }

    categories[index] = updatedCategory
    DB.saveCategories(categories)
    return NextResponse.json({ success: true, data: updatedCategory })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ success: false, error: 'Category ID required' }, { status: 400 })
    }

    const categories = DB.getCategories()
    const categoryToDelete = categories.find(c => c.id === id)
    if (categoryToDelete?.name === 'All') {
      return NextResponse.json({ success: false, error: 'Cannot delete default "All" category' }, { status: 400 })
    }

    const filtered = categories.filter(c => c.id !== id)
    DB.saveCategories(filtered)
    return NextResponse.json({ success: true, message: 'Category deleted' })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
