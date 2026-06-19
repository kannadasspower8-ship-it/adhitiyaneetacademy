import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Return dummy client during static prerendering to prevent build crashes
    return createBrowserClient(
      "https://placeholder-project.supabase.co",
      "placeholder-anon-key"
    )
  }

  return createBrowserClient(url, key)
}
