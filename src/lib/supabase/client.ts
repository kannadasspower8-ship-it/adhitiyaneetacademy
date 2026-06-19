import { createBrowserClient } from '@supabase/ssr'

function isValidSupabaseConfig(url?: string, key?: string) {
  if (!url || !key) return false
  if (url === "undefined" || key === "undefined") return false
  if (url === "null" || key === "null") return false
  if (url.includes("placeholder") || key.includes("placeholder")) return false
  if (url.includes("<your-") || key.includes("<your-")) return false
  if (!url.startsWith("http://") && !url.startsWith("https://")) return false
  return true
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!isValidSupabaseConfig(url, key)) {
    // Return dummy client during static prerendering to prevent build crashes
    return createBrowserClient(
      "https://placeholder-project.supabase.co",
      "placeholder-anon-key"
    )
  }

  return createBrowserClient(url!, key!)
}
