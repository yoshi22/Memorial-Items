import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { env } from '@/lib/env'
import {
  assertAdminNotLocked,
  clearFailedAdminAttempts,
  getAccessTokenAal,
  logAdminSecurityEvent,
  normalizeEmail,
} from '@/lib/admin-security'
import { sendAdminLoginAlert } from '@/lib/email'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/admin/login?error=no_code', request.url))
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('Auth callback exchange failed:', error.message, error)
    return NextResponse.redirect(new URL('/admin/login?error=auth_failed', request.url))
  }

  const [{ data: { user } }, { data: { session } }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ])

  const email = normalizeEmail(user?.email ?? '')
  if (!user || !env.adminEmails.includes(email)) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/admin/login?error=unauthorized', request.url))
  }

  const lockState = await assertAdminNotLocked(email)
  if (lockState.locked) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/admin/login?error=locked', request.url))
  }

  if (getAccessTokenAal(session?.access_token) === 'aal2') {
    await clearFailedAdminAttempts(email)
    await logAdminSecurityEvent({ email, eventType: 'login_succeeded', metadata: { via: 'callback' } })
    try {
      await sendAdminLoginAlert({ email, mfaCompleted: true })
    } catch (e) {
      console.error('sendAdminLoginAlert error:', e)
    }
    return NextResponse.redirect(new URL('/admin/orders', request.url))
  }

  return NextResponse.redirect(new URL('/admin/security/check', request.url))
}
