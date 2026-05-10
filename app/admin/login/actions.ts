'use server'

import { createClient } from '@/lib/supabase/server'
import { env } from '@/lib/env'
import {
  assertAdminNotLocked,
  isMagicLinkRateLimited,
  logAdminSecurityEvent,
  normalizeEmail,
  recordFailedAdminAttempt,
} from '@/lib/admin-security'

export async function sendMagicLink(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const email = normalizeEmail(String(formData.get('email') ?? ''))

  if (!email) return { error: 'メールアドレスを入力してください' }

  const lockState = await assertAdminNotLocked(email)
  if (lockState.locked) {
    return { error: 'このアカウントは一時的にロックされています。時間をおいて再試行してください。' }
  }

  if (!env.adminEmails.includes(email)) {
    await recordFailedAdminAttempt(email, 'magic_link_denied', { reason: 'not_allowlisted' })
    return { success: true }
  }

  if (await isMagicLinkRateLimited(email)) {
    await logAdminSecurityEvent({
      email,
      eventType: 'magic_link_throttled',
      metadata: {
        window_minutes: env.adminMagicLinkWindowMinutes,
        max_requests: env.adminMagicLinkMaxRequests,
      },
    })
    return { error: '短時間にリクエストが集中しています。しばらくしてから再試行してください。' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${env.appBaseUrl}/auth/callback`,
    },
  })

  if (error) {
    console.error('Magic link error:', error)
    await logAdminSecurityEvent({
      email,
      eventType: 'magic_link_failed',
      metadata: { message: error.message },
    })
    return { error: 'メールの送信に失敗しました。しばらくしてから再試行してください。' }
  }

  await logAdminSecurityEvent({ email, eventType: 'magic_link_requested' })
  return { success: true }
}
