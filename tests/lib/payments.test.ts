import { describe, it, expect, beforeEach, afterEach } from 'vitest'

// env module is a plain object with string properties, so we can patch process.env directly
function setEnv(vars: Record<string, string>) {
  for (const [k, v] of Object.entries(vars)) {
    process.env[k] = v
  }
}

function clearPaymentEnv() {
  const keys = [
    'BANK_TRANSFER_BANK_NAME',
    'BANK_TRANSFER_BRANCH_NAME',
    'BANK_TRANSFER_ACCOUNT_TYPE',
    'BANK_TRANSFER_ACCOUNT_NUMBER',
    'BANK_TRANSFER_ACCOUNT_HOLDER',
    'BANK_TRANSFER_REFERENCE',
    'PAYPAY_PAYMENT_URL',
    'PAYPAY_QR_IMAGE_URL',
    'STRIPE_PAYMENT_LINK_URL',
  ]
  for (const k of keys) {
    delete process.env[k]
  }
}

// Re-import after env change by using dynamic import with cache buster is complex in vitest;
// instead we test the logic directly by re-evaluating env values inline.
// We test the helper functions with mocked env values by importing and testing their behavior.

import {
  isBankTransferEnabled,
  isPayPayEnabled,
  isCreditCardEnabled,
  getBankTransferAccount,
  getEnabledPaymentMethods,
  getEnabledPaymentMethodIds,
  getPaymentInstructionsText,
  getSolePaymentMethodId,
} from '@/lib/payments'

const bankEnv = {
  BANK_TRANSFER_BANK_NAME: 'テスト銀行',
  BANK_TRANSFER_BRANCH_NAME: '本店',
  BANK_TRANSFER_ACCOUNT_TYPE: '普通',
  BANK_TRANSFER_ACCOUNT_NUMBER: '1234567',
  BANK_TRANSFER_ACCOUNT_HOLDER: 'テストタロウ',
  BANK_TRANSFER_REFERENCE: '',
}

describe('payments helpers (env-based)', () => {
  beforeEach(() => {
    clearPaymentEnv()
  })

  afterEach(() => {
    clearPaymentEnv()
  })

  describe('isBankTransferEnabled', () => {
    it('returns false when env is missing', () => {
      expect(isBankTransferEnabled()).toBe(false)
    })

    it('returns true when all required fields are set', () => {
      setEnv(bankEnv)
      expect(isBankTransferEnabled()).toBe(true)
    })

    it('returns false when account number is missing', () => {
      setEnv({ ...bankEnv, BANK_TRANSFER_ACCOUNT_NUMBER: '' })
      expect(isBankTransferEnabled()).toBe(false)
    })
  })

  describe('isPayPayEnabled', () => {
    it('returns false when env is missing', () => {
      expect(isPayPayEnabled()).toBe(false)
    })

    it('returns true when PAYPAY_PAYMENT_URL is set', () => {
      setEnv({ PAYPAY_PAYMENT_URL: 'https://paypay.example.com/pay' })
      expect(isPayPayEnabled()).toBe(true)
    })

    it('returns true when PAYPAY_QR_IMAGE_URL is set', () => {
      setEnv({ PAYPAY_QR_IMAGE_URL: 'https://paypay.example.com/qr.png' })
      expect(isPayPayEnabled()).toBe(true)
    })
  })

  describe('isCreditCardEnabled', () => {
    it('returns false when env is missing', () => {
      expect(isCreditCardEnabled()).toBe(false)
    })

    it('returns true when STRIPE_PAYMENT_LINK_URL is set', () => {
      setEnv({ STRIPE_PAYMENT_LINK_URL: 'https://buy.stripe.com/test' })
      expect(isCreditCardEnabled()).toBe(true)
    })
  })

  describe('getBankTransferAccount', () => {
    it('returns null when env is missing', () => {
      expect(getBankTransferAccount()).toBeNull()
    })

    it('returns account object when env is complete', () => {
      setEnv(bankEnv)
      const acc = getBankTransferAccount()
      expect(acc).not.toBeNull()
      expect(acc!.bankName).toBe('テスト銀行')
      expect(acc!.accountNumber).toBe('1234567')
      expect(acc!.accountHolder).toBe('テストタロウ')
    })
  })

  describe('getEnabledPaymentMethods', () => {
    it('returns empty array when no env is set', () => {
      expect(getEnabledPaymentMethods()).toEqual([])
    })

    it('returns only bank_transfer when only bank env is set', () => {
      setEnv(bankEnv)
      const methods = getEnabledPaymentMethods()
      expect(methods).toHaveLength(1)
      expect(methods[0]!.id).toBe('bank_transfer')
    })

    it('returns bank_transfer and paypay_qr when both are set', () => {
      setEnv({ ...bankEnv, PAYPAY_PAYMENT_URL: 'https://paypay.example.com/pay' })
      const methods = getEnabledPaymentMethods()
      expect(methods).toHaveLength(2)
      expect(methods.map((m) => m.id)).toEqual(['bank_transfer', 'paypay_qr'])
    })

    it('returns all three when all env are set', () => {
      setEnv({
        ...bankEnv,
        PAYPAY_PAYMENT_URL: 'https://paypay.example.com/pay',
        STRIPE_PAYMENT_LINK_URL: 'https://buy.stripe.com/test',
      })
      const methods = getEnabledPaymentMethods()
      expect(methods).toHaveLength(3)
      expect(methods.map((m) => m.id)).toEqual(['bank_transfer', 'paypay_qr', 'credit_card'])
    })

    it('preserves order: bank_transfer → paypay_qr → credit_card', () => {
      setEnv({
        ...bankEnv,
        PAYPAY_PAYMENT_URL: 'https://paypay.example.com/pay',
        STRIPE_PAYMENT_LINK_URL: 'https://buy.stripe.com/test',
      })
      const ids = getEnabledPaymentMethods().map((m) => m.id)
      expect(ids[0]).toBe('bank_transfer')
      expect(ids[1]).toBe('paypay_qr')
      expect(ids[2]).toBe('credit_card')
    })
  })

  describe('getSolePaymentMethodId', () => {
    it('returns null when no methods enabled', () => {
      expect(getSolePaymentMethodId()).toBeNull()
    })

    it('returns the sole method id when only one is enabled', () => {
      setEnv(bankEnv)
      expect(getSolePaymentMethodId()).toBe('bank_transfer')
    })

    it('returns null when multiple methods are enabled', () => {
      setEnv({ ...bankEnv, PAYPAY_PAYMENT_URL: 'https://paypay.example.com/pay' })
      expect(getSolePaymentMethodId()).toBeNull()
    })
  })

  describe('getEnabledPaymentMethodIds', () => {
    it('returns ids array matching enabled methods', () => {
      setEnv(bankEnv)
      expect(getEnabledPaymentMethodIds()).toEqual(['bank_transfer'])
    })

    it('does not include unknown', () => {
      setEnv(bankEnv)
      expect(getEnabledPaymentMethodIds()).not.toContain('unknown')
    })
  })

  describe('getPaymentInstructionsText', () => {
    it('renders bank transfer instructions with account details', () => {
      setEnv(bankEnv)
      const text = getPaymentInstructionsText('bank_transfer')
      expect(text).toContain('お支払い方法: 銀行振込')
      expect(text).toContain('銀行名: テスト銀行')
      expect(text).toContain('口座番号: 1234567')
      expect(text).toContain('※ ご入金確認後 5 営業日以内に初稿をご案内します。')
    })

    it('renders bank transfer fallback when account details are missing', () => {
      expect(getPaymentInstructionsText('bank_transfer')).toBe('お支払い方法: 銀行振込\n振込先情報は別途メールでご案内します。')
    })

    it('renders credit card payment link when configured', () => {
      setEnv({ STRIPE_PAYMENT_LINK_URL: 'https://buy.stripe.com/test' })
      expect(getPaymentInstructionsText('credit_card')).toBe(
        'お支払い方法: クレジットカード\nお支払いリンク:\nhttps://buy.stripe.com/test',
      )
    })

    it('renders credit card fallback when payment link is missing', () => {
      expect(getPaymentInstructionsText('credit_card')).toBe('お支払い方法: クレジットカード\n決済リンクは準備でき次第お送りします。')
    })

    it('renders PayPay payment link instructions when configured', () => {
      setEnv({ PAYPAY_PAYMENT_URL: 'https://paypay.example.com/pay' })
      const text = getPaymentInstructionsText('paypay_qr')
      expect(text).toContain('お支払い方法: PayPay')
      expect(text).toContain('https://paypay.example.com/pay')
      expect(text).toContain('※ 送金時のメッセージ欄にペット名を入れてください（注文照合に使用します）。')
    })

    it('renders PayPay QR fallback when only QR is configured', () => {
      setEnv({ PAYPAY_QR_IMAGE_URL: 'https://paypay.example.com/qr.png' })
      expect(getPaymentInstructionsText('paypay_qr')).toContain('PayPay QR は注文確認ページに表示されています。')
    })

    it('renders unknown payment method label', () => {
      expect(getPaymentInstructionsText('unknown')).toBe('お支払い方法: 未選択')
    })
  })
})
