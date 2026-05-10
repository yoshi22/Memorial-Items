import { env } from '@/lib/env'
import type { BankTransferAccount } from '@/lib/payments'
import { getPaymentMethodLabel } from '@/lib/variants'
import { BankTransferNotice } from '@/components/order/BankTransferNotice'

interface Props {
  paymentMethod: string
  petName: string
  bankAccount: BankTransferAccount | null
  variant: 'pending' | 'success'
}

export function PaymentInstructions({ paymentMethod, petName, bankAccount, variant }: Props) {
  if (paymentMethod === 'bank_transfer') {
    if (!bankAccount) return null
    const notice = <BankTransferNotice account={bankAccount} petName={petName} variant={variant} />
    return variant === 'success' ? <div className="mb-6">{notice}</div> : notice
  }

  if (paymentMethod === 'credit_card') {
    return variant === 'success'
      ? <CreditCardSuccessInstructions paymentMethod={paymentMethod} />
      : <CreditCardPendingInstructions />
  }

  if (paymentMethod === 'paypay_qr') {
    return variant === 'success' ? <PayPaySuccessInstructions /> : <PayPayPendingInstructions />
  }

  return variant === 'success'
    ? (
        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-700">お支払い方法のご案内はメールでお送りします。</p>
        </div>
      )
    : <p className="text-sm text-gray-600">お支払い方法のご案内はメールでお送りします。</p>
}

function CreditCardSuccessInstructions({ paymentMethod }: { paymentMethod: string }) {
  return (
    <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
      <p className="text-sm font-medium text-yellow-800 mb-2">お支払いについて</p>
      <p className="text-sm text-yellow-700 mb-3">選択されたお支払い方法: {getPaymentMethodLabel(paymentMethod)}</p>
      {env.stripePaymentLinkUrl ? (
        <a
          href={env.stripePaymentLinkUrl}
          className="inline-block rounded-md bg-yellow-600 px-4 py-2 text-sm text-white hover:bg-yellow-700"
          target="_blank"
          rel="noopener noreferrer"
        >
          お支払いへ進む
        </a>
      ) : (
        <p className="text-sm text-yellow-700">決済リンクは準備でき次第、メールでご案内します。</p>
      )}
    </div>
  )
}

function CreditCardPendingInstructions() {
  return env.stripePaymentLinkUrl ? (
    <a
      href={env.stripePaymentLinkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
    >
      クレジットカードで支払う
    </a>
  ) : (
    <p className="text-sm text-gray-600">決済リンクは準備でき次第、メールでご案内します。</p>
  )
}

function PayPaySuccessInstructions() {
  return (
    <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-left">
      <p className="text-sm font-medium text-blue-800 mb-2">お支払いについて（PayPay）</p>
      {env.paypayQrImageUrl && (
        <img src={env.paypayQrImageUrl} alt="PayPay QR" className="mx-auto mb-3 h-48 w-48 rounded border border-blue-100 bg-white p-2" />
      )}
      {env.paypayPaymentUrl && (
        <a
          href={env.paypayPaymentUrl}
          className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 mb-3"
          target="_blank"
          rel="noopener noreferrer"
        >
          PayPay案内を開く
        </a>
      )}
      <PayPayNotes className="space-y-1 text-sm text-blue-700 mt-2" />
    </div>
  )
}

function PayPayPendingInstructions() {
  return (
    <div className="space-y-3">
      {env.paypayQrImageUrl && (
        <img src={env.paypayQrImageUrl} alt="PayPay QR" className="h-48 w-48 rounded border border-gray-200 bg-white p-2" />
      )}
      {env.paypayPaymentUrl && (
        <a
          href={env.paypayPaymentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
        >
          PayPay案内を開く
        </a>
      )}
      <PayPayNotes className="space-y-1 text-sm text-gray-600" />
    </div>
  )
}

function PayPayNotes({ className }: { className: string }) {
  return (
    <ul className={className}>
      <li>・送金時のメッセージ欄にペット名を入れてください（注文照合に使用します）。</li>
      <li>・ご入金確認後 5 営業日以内に初稿をご案内します。</li>
    </ul>
  )
}
