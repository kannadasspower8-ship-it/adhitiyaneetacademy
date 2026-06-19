import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function isValidSupabaseConfig(url?: string, key?: string) {
  if (!url || !key) return false
  if (url === "undefined" || key === "undefined") return false
  if (url === "null" || key === "null") return false
  if (url.includes("placeholder") || key.includes("placeholder")) return false
  if (url.includes("<your-") || key.includes("<your-")) return false
  if (!url.startsWith("http://") && !url.startsWith("https://")) return false
  return true
}

export async function createClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!isValidSupabaseConfig(url, key)) {
    // Return dummy client during static prerendering to prevent build crashes
    return createServerClient(
      "https://placeholder-project.supabase.co",
      "placeholder-anon-key",
      {
        cookies: {
          getAll() {
            return []
          },
          setAll() {},
        },
      }
    )
  }

  return createServerClient(
    url!,
    key!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Can be ignored if middleware handles session refreshing
          }
        },
      },
    }
  )
}
