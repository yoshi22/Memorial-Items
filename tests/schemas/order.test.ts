import { describe, it, expect } from 'vitest'
import { orderSchema } from '@/lib/schemas/order'

const valid = {
  customer_name: '山田 太郎',
  customer_email: 'yamada@example.com',
  pet_name: 'ポチ',
  style: 'clean_illustration' as const,
  size: 'M' as const,
  frame: 'black' as const,
  payment_method: 'bank_transfer' as const,
  must_keep_features: '鼻の周りの白さ、左耳の折れ',
}

describe('orderSchema', () => {
  it('accepts valid input', () => {
    const result = orderSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('requires customer_name', () => {
    const result = orderSchema.safeParse({ ...valid, customer_name: '' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = orderSchema.safeParse({ ...valid, customer_email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('requires must_keep_features', () => {
    const result = orderSchema.safeParse({ ...valid, must_keep_features: '' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid style', () => {
    const result = orderSchema.safeParse({ ...valid, style: 'unknown_style' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid size', () => {
    const result = orderSchema.safeParse({ ...valid, size: 'XL' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid frame', () => {
    const result = orderSchema.safeParse({ ...valid, frame: 'gold' })
    expect(result.success).toBe(false)
  })

  it('requires payment_method', () => {
    const result = orderSchema.safeParse({ ...valid, payment_method: undefined })
    expect(result.success).toBe(false)
  })

  it('accepts all valid payment method values', () => {
    for (const payment_method of ['bank_transfer', 'credit_card', 'paypay_qr'] as const) {
      expect(orderSchema.safeParse({ ...valid, payment_method }).success).toBe(true)
    }
  })

  it('rejects unknown as payment_method', () => {
    const result = orderSchema.safeParse({ ...valid, payment_method: 'unknown' })
    expect(result.success).toBe(false)
  })

  it('accepts all valid style values', () => {
    for (const style of ['clean_illustration', 'soft_watercolor', 'modern_portrait'] as const) {
      expect(orderSchema.safeParse({ ...valid, style }).success).toBe(true)
    }
  })

  it('accepts all valid size values', () => {
    for (const size of ['S', 'M', 'L'] as const) {
      expect(orderSchema.safeParse({ ...valid, size }).success).toBe(true)
    }
  })

  it('accepts notes as optional', () => {
    const result = orderSchema.safeParse({ ...valid, notes: undefined })
    expect(result.success).toBe(true)
  })
})
