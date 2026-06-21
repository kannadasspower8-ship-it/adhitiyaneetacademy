import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { verifyToken } from '@/lib/session'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next()

  const url = request.nextUrl.clone()

  // Only run session and user checks for admin, student and login routes
  const isAdminRoute = url.pathname.startsWith('/admin/dashboard')
  const isStudentRoute = url.pathname.startsWith('/student/dashboard')
  const isLoginRoute = url.pathname === '/login'

  if (!isAdminRoute && !isStudentRoute && !isLoginRoute) {
    return supabaseResponse
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey || supabaseUrl === "undefined" || supabaseKey === "undefined" || !supabaseUrl.startsWith("http")) {
    // If Supabase is not configured (e.g. during build/static rendering), just bypass the middleware check
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Guard student dashboard route
  if (isStudentRoute) {
    const token = request.cookies.get('student_session')?.value
    const payload = token ? await verifyToken(token) : null
    if (!payload || !payload.student_id) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Guard routes starting with /admin/dashboard
  if (isAdminRoute) {
    if (!user) {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    const role = user.user_metadata?.role

    if (role !== 'admin') {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated users away from /login
  if (isLoginRoute) {
    if (user) {
      const role = user.user_metadata?.role
      if (role === 'admin') {
        url.pathname = '/admin/dashboard'
        return NextResponse.redirect(url)
      }
    }
    const token = request.cookies.get('student_session')?.value
    const payload = token ? await verifyToken(token) : null
    if (payload && payload.student_id) {
      url.pathname = '/student/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
