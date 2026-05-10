import { describe, it, expect } from 'vitest'
import { normalizeEmail } from '@/lib/admin-security'

// Pure logic test for admin email whitelist matching
// (requireAdmin() itself depends on Next.js runtime, so we test the core logic here)

function isAdminEmail(email: string, adminEmails: string[]): boolean {
  return adminEmails.includes(normalizeEmail(email))
}

describe('admin email whitelist', () => {
  const adminEmails = ['admin@example.com', 'ops@example.com']

  it('allows listed admin emails', () => {
    expect(isAdminEmail('admin@example.com', adminEmails)).toBe(true)
    expect(isAdminEmail('ops@example.com', adminEmails)).toBe(true)
  })

  it('rejects unlisted emails', () => {
    expect(isAdminEmail('attacker@evil.com', adminEmails)).toBe(false)
    expect(isAdminEmail('admin@evil.com', adminEmails)).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isAdminEmail('', adminEmails)).toBe(false)
  })

  it('normalizes casing', () => {
    expect(isAdminEmail('Admin@example.com', adminEmails)).toBe(true)
    expect(isAdminEmail('ADMIN@EXAMPLE.COM', adminEmails)).toBe(true)
  })

  it('handles empty whitelist', () => {
    expect(isAdminEmail('admin@example.com', [])).toBe(false)
  })
})
