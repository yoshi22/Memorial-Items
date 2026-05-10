import { describe, it, expect } from 'vitest'
import { revisionRequestSchema } from '@/lib/schemas/proof'

describe('revisionRequestSchema', () => {
  it('accepts valid request text', () => {
    const result = revisionRequestSchema.safeParse({ request_text: '目の色を少し明るくしてください' })
    expect(result.success).toBe(true)
  })

  it('rejects empty request text', () => {
    const result = revisionRequestSchema.safeParse({ request_text: '' })
    expect(result.success).toBe(false)
  })

  it('rejects text over 2000 chars', () => {
    const result = revisionRequestSchema.safeParse({ request_text: 'a'.repeat(2001) })
    expect(result.success).toBe(false)
  })

  it('accepts exactly 2000 chars', () => {
    const result = revisionRequestSchema.safeParse({ request_text: 'a'.repeat(2000) })
    expect(result.success).toBe(true)
  })
})
