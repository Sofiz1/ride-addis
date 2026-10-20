import { NextRequest, NextResponse } from 'next/server'
import { DB } from '@/lib/db'

export async function GET() {
  try {
    const settings = DB.getSettings()
    return NextResponse.json({ success: true, data: settings })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const current = DB.getSettings()
    const updated = {
      ...current,
      ...body
    }
    DB.saveSettings(updated)
    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
