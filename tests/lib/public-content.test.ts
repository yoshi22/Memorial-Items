import { afterEach, describe, expect, it } from 'vitest'
import { getFallbackFaqItems, getPublicFaqItems } from '@/lib/public-content'
import type { FaqItem } from '@/lib/supabase/types'

function makeFaqItem(overrides: Partial<FaqItem>): FaqItem {
  return {
    id: 'faq-1',
    question: 'default question',
    answer: 'default answer',
    sort_order: 10,
    is_published: true,
    created_at: '2026-05-03T00:00:00.000Z',
    updated_at: '2026-05-03T00:00:00.000Z',
    ...overrides,
  }
}

describe('public FAQ content', () => {
  afterEach(() => {
    delete process.env.BANK_TRANSFER_BANK_NAME
    delete process.env.BANK_TRANSFER_BRANCH_NAME
    delete process.env.BANK_TRANSFER_ACCOUNT_TYPE
    delete process.env.BANK_TRANSFER_ACCOUNT_NUMBER
    delete process.env.BANK_TRANSFER_ACCOUNT_HOLDER
    delete process.env.BANK_TRANSFER_REFERENCE
    delete process.env.PAYPAY_PAYMENT_URL
    delete process.env.PAYPAY_QR_IMAGE_URL
  })

  it('returns fallback FAQ when no published items exist', () => {
    const items = getPublicFaqItems([])

    expect(items).toHaveLength(7)
    expect(items[0]?.question).toBe('どんな写真を送ればよいですか？')
    expect(items.some((item) => item.answer.includes('ダウンロード形式で納品'))).toBe(true)
  })

  it('returns published DB items sorted by sort order when available', () => {
    const items = getPublicFaqItems([
      makeFaqItem({ id: 'faq-2', question: '後', sort_order: 20 }),
      makeFaqItem({ id: 'faq-1', question: '先', sort_order: 10 }),
    ])

    expect(items.map((item) => item.question)).toEqual(['先', '後'])
  })

  it('filters out unpublished DB items', () => {
    const items = getPublicFaqItems([
      makeFaqItem({ id: 'faq-1', question: '公開', is_published: true }),
      makeFaqItem({ id: 'faq-2', question: '非公開', sort_order: 20, is_published: false }),
    ])

    expect(items).toHaveLength(1)
    expect(items[0]?.question).toBe('公開')
  })

  it('shows bank transfer as the default payment method in fallback content', () => {
    process.env.BANK_TRANSFER_BANK_NAME = 'テスト銀行'
    process.env.BANK_TRANSFER_BRANCH_NAME = '本店'
    process.env.BANK_TRANSFER_ACCOUNT_TYPE = '普通'
    process.env.BANK_TRANSFER_ACCOUNT_NUMBER = '1234567'
    process.env.BANK_TRANSFER_ACCOUNT_HOLDER = 'テストタロウ'

    const paymentFaq = getFallbackFaqItems().find((item) => item.question === '支払い方法を教えてください。')

    expect(paymentFaq?.answer).toContain('銀行振込')
  })
})
