import { headers } from 'next/headers'
import { env } from '@/lib/env'
import { createAdminClient } from '@/lib/supabase/admin'
import type { AdminSecurityEventType, AdminLoginProtection } from '@/lib/supabase/types'

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function decodeJwtPayload(accessToken: string | null | undefined): Record<string, unknown> | null {
  if (!accessToken) return null
  const parts = accessToken.split('.')
  if (parts.length < 2 || !parts[1]) return null

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const json = Buffer.from(padded, 'base64').toString('utf8')
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

export function getAccessTokenAal(accessToken: string | null | undefined): 'aal1' | 'aal2' | null {
  const payload = decodeJwtPayload(accessToken)
  const aal = payload?.aal
  return aal === 'aal1' || aal === 'aal2' ? aal : null
}

export function isLockActive(lockedUntil: string | null | undefined, now = new Date()) {
  if (!lockedUntil) return false
  return new Date(lockedUntil).getTime() > now.getTime()
}

export function shouldLockAccount(failedAttempts: number, threshold = env.adminLockoutThreshold) {
  return failedAttempts >= threshold
}

export function computeLockedUntil(minutes = env.adminLockoutMinutes, now = new Date()) {
  return new Date(now.getTime() + minutes * 60 * 1000).toISOString()
}

export function getSecurityAlertRecipients(extraRecipients: string[] = []) {
  return Array.from(new Set([...extraRecipients.map(normalizeEmail), ...(env.securityAlertEmails.length > 0 ? env.securityAlertEmails : env.adminEmails)]))
}

export async function getRequestSecurityContext() {
  const headerStore = await headers()
  const forwardedFor = headerStore.get('x-forwarded-for')
  return {
    ipAddress: forwardedFor?.split(',')[0]?.trim() ?? null,
    userAgent: headerStore.get('user-agent'),
  }
}

export async function logAdminSecurityEvent(params: {
  email?: string | null
  eventType: AdminSecurityEventType
  metadata?: Record<string, unknown> | null
}) {
  const { ipAddress, userAgent } = await getRequestSecurityContext()
  const admin = createAdminClient()
  await admin.from('admin_security_events').insert({
    email: params.email ? normalizeEmail(params.email) : null,
    event_type: params.eventType,
    ip_address: ipAddress,
    user_agent: userAgent,
    metadata: params.metadata ?? null,
  })
}

export async function getLoginProtection(email: string) {
  const admin = createAdminClient()
  const normalizedEmail = normalizeEmail(email)
  const { data } = await admin
    .from('admin_login_protection')
    .select('*')
    .eq('email', normalizedEmail)
    .maybeSingle()

  return data as AdminLoginProtection | null
}

export async function ensureLoginProtectionRow(email: string) {
  const admin = createAdminClient()
  const normalizedEmail = normalizeEmail(email)
  await admin.from('admin_login_protection').upsert({
    email: normalizedEmail,
    failed_attempts: 0,
    locked_until: null,
    last_failed_at: null,
    last_success_at: null,
  }, { onConflict: 'email', ignoreDuplicates: true })
}

export async function recordFailedAdminAttempt(email: string, eventType: AdminSecurityEventType, metadata?: Record<string, unknown>) {
  const normalizedEmail = normalizeEmail(email)
  await ensureLoginProtectionRow(normalizedEmail)
  const current = await getLoginProtection(normalizedEmail)
  const nextAttempts = (current?.failed_attempts ?? 0) + 1
  const shouldLock = shouldLockAccount(nextAttempts)
  const lockedUntil = shouldLock ? computeLockedUntil() : null
  const admin = createAdminClient()

  await admin
    .from('admin_login_protection')
    .update({
      failed_attempts: nextAttempts,
      last_failed_at: new Date().toISOString(),
      locked_until: lockedUntil,
    })
    .eq('email', normalizedEmail)

  await logAdminSecurityEvent({
    email: normalizedEmail,
    eventType,
    metadata: {
      failed_attempts: nextAttempts,
      ...(metadata ?? {}),
    },
  })

  if (lockedUntil) {
    await logAdminSecurityEvent({
      email: normalizedEmail,
      eventType: 'account_locked',
      metadata: { locked_until: lockedUntil, failed_attempts: nextAttempts },
    })
  }

  return { failedAttempts: nextAttempts, lockedUntil }
}

export async function clearFailedAdminAttempts(email: string) {
  const normalizedEmail = normalizeEmail(email)
  await ensureLoginProtectionRow(normalizedEmail)
  const admin = createAdminClient()
  await admin
    .from('admin_login_protection')
    .update({
      failed_attempts: 0,
      locked_until: null,
      last_success_at: new Date().toISOString(),
    })
    .eq('email', normalizedEmail)
}

export async function assertAdminNotLocked(email: string) {
  const protection = await getLoginProtection(email)
  if (protection && isLockActive(protection.locked_until)) {
    return {
      locked: true,
      lockedUntil: protection.locked_until,
      failedAttempts: protection.failed_attempts,
    }
  }

  return {
    locked: false,
    lockedUntil: protection?.locked_until ?? null,
    failedAttempts: protection?.failed_attempts ?? 0,
  }
}

export async function isMagicLinkRateLimited(email: string) {
  const normalizedEmail = normalizeEmail(email)
  const admin = createAdminClient()
  const cutoff = new Date(Date.now() - env.adminMagicLinkWindowMinutes * 60 * 1000).toISOString()
  const { count } = await admin
    .from('admin_security_events')
    .select('*', { count: 'exact', head: true })
    .eq('email', normalizedEmail)
    .eq('event_type', 'magic_link_requested')
    .gte('created_at', cutoff)

  return (count ?? 0) >= env.adminMagicLinkMaxRequests
}
