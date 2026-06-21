import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { createClient } from '@/lib/supabase/server'
import { signToken } from '@/lib/session'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Retrieve student by username using security definer RPC
    const { data: students, error: studentError } = await supabase.rpc(
      'get_student_by_username',
      { p_username: username.trim() }
    )

    if (studentError) {
      console.error('RPC Error:', studentError)
      return NextResponse.json(
        { error: 'An error occurred during authentication' },
        { status: 500 }
      )
    }

    if (!students || students.length === 0) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    const student = students[0]

    // Verify status
    if (student.status !== 'Active') {
      return NextResponse.json(
        { error: 'Student account is inactive. Please contact administration.' },
        { status: 403 }
      )
    }

    // Verify password with bcrypt (the mobile number is the password)
    const isMatch = bcrypt.compareSync(password.trim(), student.password_hash)
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Update last login
    await supabase.rpc('update_student_last_login', { student_uuid: student.id })

    // Generate signed token valid for 24 hours
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000
    const token = await signToken({ student_id: student.id, expiresAt })

    // Set HttpOnly, Secure, SameSite=Lax cookie valid for 24 hours
    const cookieStore = await cookies()
    cookieStore.set('student_session', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours in seconds
    })

    return NextResponse.json({ success: true, name: student.name })
  } catch (err: any) {
    console.error('Login Route Error:', err)
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
