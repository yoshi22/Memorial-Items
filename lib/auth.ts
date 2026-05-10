import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { env } from '@/lib/env'
import { assertAdminNotLocked, getAccessTokenAal, normalizeEmail } from '@/lib/admin-security'

export async function requireAdminBase() {
  const supabase = await createClient()
  const [{ data: { user } }, { data: { session } }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ])

  if (!user) {
    redirect('/admin/login')
  }

  const email = normalizeEmail(user.email ?? '')
  if (!env.adminEmails.includes(email)) {
    await supabase.auth.signOut()
    redirect('/admin/login?error=unauthorized')
  }

  const lockState = await assertAdminNotLocked(email)
  if (lockState.locked) {
    await supabase.auth.signOut()
    redirect('/admin/login?error=locked')
  }

  return { user, aal: getAccessTokenAal(session?.access_token) }
}

export async function requireAdmin() {
  const admin = await requireAdminBase()
  if (admin.aal !== 'aal2') {
    redirect('/admin/security/check')
  }
  return admin.user
}

export async function getAdminSession() {
  try {
    const user = await requireAdmin()
    return user
  } catch {
    return null
  }
}
