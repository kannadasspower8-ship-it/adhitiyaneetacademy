import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    // Expire the secure HttpOnly cookie immediately
    cookieStore.set('student_session', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // 0 indicates immediate expiration
    })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
