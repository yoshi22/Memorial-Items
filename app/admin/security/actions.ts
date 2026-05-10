'use server'

import {
  assertAdminNotLocked,
  clearFailedAdminAttempts,
  logAdminSecurityEvent,
  recordFailedAdminAttempt,
} from '@/lib/admin-security'
import { requireAdminBase } from '@/lib/auth'
import { sendAdminLoginAlert, sendAdminMfaEnrolledAlert } from '@/lib/email'

export async function getMfaAttemptState() {
  const { user } = await requireAdminBase()
  const email = user.email ?? ''
  return assertAdminNotLocked(email)
}

export async function recordMfaEnrollStarted() {
  const { user } = await requireAdminBase()
  await logAdminSecurityEvent({
    email: user.email ?? '',
    eventType: 'mfa_enroll_started',
  })
}

export async function recordMfaFailure(reason: string) {
  const { user } = await requireAdminBase()
  return recordFailedAdminAttempt(user.email ?? '', 'mfa_failed', { reason })
}

export async function recordMfaSuccess(mode: 'enrolled' | 'verified') {
  const { user } = await requireAdminBase()
  const email = user.email ?? ''
  await clearFailedAdminAttempts(email)
  await logAdminSecurityEvent({
    email,
    eventType: 'mfa_verified',
    metadata: { mode },
  })
  await logAdminSecurityEvent({
    email,
    eventType: 'login_succeeded',
    metadata: { via: mode === 'enrolled' ? 'mfa_enroll' : 'mfa_verify' },
  })

  try {
    if (mode === 'enrolled') {
      await sendAdminMfaEnrolledAlert({ email })
    }
    await sendAdminLoginAlert({ email, mfaCompleted: true })
  } catch (e) {
    console.error('security alert email error:', e)
  }
}
