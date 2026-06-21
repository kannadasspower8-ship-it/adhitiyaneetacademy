import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { verifyToken } from '@/lib/session'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('student_session')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No active student session' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload || !payload.student_id) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid session token' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Retrieve profile details using security-definer RPC
    const { data: profiles, error: profileErr } = await supabase.rpc(
      'get_student_profile_by_id',
      { student_uuid: payload.student_id }
    )

    if (profileErr || !profiles || profiles.length === 0) {
      console.error('Profile RPC Error:', profileErr)
      return NextResponse.json(
        { error: 'Failed to retrieve profile data' },
        { status: 500 }
      )
    }

    // Retrieve marks history using security-definer RPC
    const { data: marks, error: marksErr } = await supabase.rpc(
      'get_student_marks_by_id',
      { student_uuid: payload.student_id }
    )

    if (marksErr) {
      console.error('Marks RPC Error:', marksErr)
      return NextResponse.json(
        { error: 'Failed to retrieve marks history' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      student: profiles[0],
      marks: marks || []
    })
  } catch (err: any) {
    console.error('Dashboard Data API Error:', err)
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
