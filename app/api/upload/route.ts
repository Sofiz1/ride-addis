import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 })
    }

    // Verify file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Only JPG, PNG, WebP, GIF, or SVG images are allowed' }, { status: 400 })
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Generate safe unique filename
    const ext = path.extname(file.name) || '.jpg'
    const cleanName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '')
    const fileName = `${cleanName}-${Date.now()}${ext}`
    const filePath = path.join(uploadsDir, fileName)

    // Convert file to Buffer and write to disk
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    fs.writeFileSync(filePath, buffer)

    const publicUrl = `/uploads/${fileName}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      size: buffer.length
    })
  } catch (error: any) {
    console.error('File upload error:', error)
    return NextResponse.json({ success: false, error: error.message || 'File upload failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const url = body?.url as string | undefined

    if (!url || !url.startsWith('/uploads/')) {
      return NextResponse.json({ success: false, error: 'Invalid file URL' }, { status: 400 })
    }

    const fileName = path.basename(url)
    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName)

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    return NextResponse.json({ success: true, message: `File ${fileName} deleted` })
  } catch (error: any) {
    console.error('File delete error:', error)
    return NextResponse.json({ success: false, error: error.message || 'File delete failed' }, { status: 500 })
  }
}
