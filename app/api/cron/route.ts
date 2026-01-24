import { NextResponse } from 'next/server'
import { checkAndReleaseExpiredReservations } from '@/lib/auto-release'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await checkAndReleaseExpiredReservations()
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
