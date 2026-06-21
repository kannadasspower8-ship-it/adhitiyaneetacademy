import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Logs an administrative action to the audit_logs table.
 * Resolves the admin user name/email from the active Supabase session.
 */
export async function logAdminAction(supabase: SupabaseClient, action: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const adminName = user?.email || user?.user_metadata?.full_name || 'System Admin'

    const { error } = await supabase
      .from('audit_logs')
      .insert({
        admin_name: adminName,
        action: action,
      })

    if (error) {
      console.error('Audit log insertion failed:', error.message)
    }
  } catch (err) {
    console.error('Failed to log admin action:', err)
  }
}
