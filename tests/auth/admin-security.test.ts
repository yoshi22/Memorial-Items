import { describe, expect, it } from 'vitest'
import {
  computeLockedUntil,
  decodeJwtPayload,
  getAccessTokenAal,
  getSecurityAlertRecipients,
  isLockActive,
  normalizeEmail,
  shouldLockAccount,
} from '@/lib/admin-security'

describe('admin security helpers', () => {
  it('normalizes admin emails to lowercase', () => {
    expect(normalizeEmail(' Admin@Example.COM ')).toBe('admin@example.com')
  })

  it('detects account lock threshold', () => {
    expect(shouldLockAccount(9, 10)).toBe(false)
    expect(shouldLockAccount(10, 10)).toBe(true)
  })

  it('computes future lock timestamp', () => {
    const now = new Date('2026-04-19T00:00:00.000Z')
    expect(computeLockedUntil(30, now)).toBe('2026-04-19T00:30:00.000Z')
  })

  it('checks whether a lock is still active', () => {
    const now = new Date('2026-04-19T00:10:00.000Z')
    expect(isLockActive('2026-04-19T00:30:00.000Z', now)).toBe(true)
    expect(isLockActive('2026-04-19T00:05:00.000Z', now)).toBe(false)
  })

  it('extracts aal from a jwt payload', () => {
    const payload = Buffer.from(JSON.stringify({ aal: 'aal2', sub: '123' })).toString('base64url')
    const token = `header.${payload}.signature`
    expect(getAccessTokenAal(token)).toBe('aal2')
    expect(decodeJwtPayload(token)?.sub).toBe('123')
  })

  it('builds a deduplicated security alert list', () => {
    expect(getSecurityAlertRecipients(['admin@example.com']).includes('admin@example.com')).toBe(true)
  })
})
