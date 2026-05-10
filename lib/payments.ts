import { getPaymentMethodLabel, type PaymentMethodId } from '@/lib/variants'

function read(name: string): string {
  return process.env[name]?.trim() ?? ''
}

export interface BankTransferAccount {
  bankName: string
  branchName: string
  accountType: string
  accountNumber: string
  accountHolder: string
  reference: string
}

export type EnabledPaymentMethodId = Exclude<PaymentMethodId, 'unknown'>

export interface PaymentOption {
  id: EnabledPaymentMethodId
  label: string
}

export function isBankTransferEnabled(): boolean {
  return !!(read('BANK_TRANSFER_BANK_NAME') && read('BANK_TRANSFER_ACCOUNT_NUMBER') && read('BANK_TRANSFER_ACCOUNT_HOLDER'))
}

export function isPayPayEnabled(): boolean {
  return !!(read('PAYPAY_PAYMENT_URL') || read('PAYPAY_QR_IMAGE_URL'))
}

export function isCreditCardEnabled(): boolean {
  return !!read('STRIPE_PAYMENT_LINK_URL')
}

export function getBankTransferAccount(): BankTransferAccount | null {
  if (!isBankTransferEnabled()) return null
  return {
    bankName: read('BANK_TRANSFER_BANK_NAME'),
    branchName: read('BANK_TRANSFER_BRANCH_NAME'),
    accountType: read('BANK_TRANSFER_ACCOUNT_TYPE') || '普通',
    accountNumber: read('BANK_TRANSFER_ACCOUNT_NUMBER'),
    accountHolder: read('BANK_TRANSFER_ACCOUNT_HOLDER'),
    reference: read('BANK_TRANSFER_REFERENCE'),
  }
}

export function getEnabledPaymentMethods(): PaymentOption[] {
  const methods: PaymentOption[] = []
  if (isBankTransferEnabled()) methods.push({ id: 'bank_transfer', label: '銀行振込' })
  if (isPayPayEnabled()) methods.push({ id: 'paypay_qr', label: 'PayPay QR' })
  if (isCreditCardEnabled()) methods.push({ id: 'credit_card', label: 'クレジットカード' })
  return methods
}

export function getEnabledPaymentMethodIds(): readonly EnabledPaymentMethodId[] {
  return getEnabledPaymentMethods().map((m) => m.id)
}

export function getSolePaymentMethodId(): EnabledPaymentMethodId | null {
  const methods = getEnabledPaymentMethods()
  return methods.length === 1 ? methods[0]!.id : null
}

export function getPaymentInstructionsText(paymentMethod: string): string {
  if (paymentMethod === 'bank_transfer') {
    const acc = getBankTransferAccount()
    if (!acc) return 'お支払い方法: 銀行振込\n振込先情報は別途メールでご案内します。'
    const lines = [
      'お支払い方法: 銀行振込',
      '',
      '【お振込先】',
      `銀行名: ${acc.bankName}`,
      acc.branchName ? `支店名: ${acc.branchName}` : null,
      `口座種別: ${acc.accountType}`,
      `口座番号: ${acc.accountNumber}`,
      `口座名義: ${acc.accountHolder}`,
      acc.reference ? `振込時の参考: ${acc.reference}` : null,
      '',
      '※ お振込手数料はお客様にてご負担ください。',
      '※ 振込人名にペット名を続けてご記入ください（例: ヤマダタロウ ポチ）。',
      '※ ご入金確認後 5 営業日以内に初稿をご案内します。',
    ]
    return lines.filter((l) => l !== null).join('\n')
  }

  if (paymentMethod === 'credit_card') {
    const stripePaymentLinkUrl = read('STRIPE_PAYMENT_LINK_URL')
    return stripePaymentLinkUrl
      ? `お支払い方法: クレジットカード\nお支払いリンク:\n${stripePaymentLinkUrl}`
      : 'お支払い方法: クレジットカード\n決済リンクは準備でき次第お送りします。'
  }

  if (paymentMethod === 'paypay_qr') {
    const paypayPaymentUrl = read('PAYPAY_PAYMENT_URL')
    const paypayQrImageUrl = read('PAYPAY_QR_IMAGE_URL')
    const lines = ['お支払い方法: PayPay', '']
    if (paypayPaymentUrl) {
      lines.push('お支払いリンク:', paypayPaymentUrl, '')
    } else if (paypayQrImageUrl) {
      lines.push('PayPay QR は注文確認ページに表示されています。', '')
    }
    lines.push(
      '※ 送金時のメッセージ欄にペット名を入れてください（注文照合に使用します）。',
      '※ ご入金確認後 5 営業日以内に初稿をご案内します。',
    )
    return lines.join('\n')
  }

  return `お支払い方法: ${getPaymentMethodLabel(paymentMethod)}`
}
