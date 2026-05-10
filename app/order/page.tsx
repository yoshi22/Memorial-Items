import { Nav } from '@/components/common/Nav'
import { Footer } from '@/components/common/Footer'
import { OrderForm } from '@/components/order/OrderForm'
import { businessInfo } from '@/lib/public-business'
import { getBankTransferAccount, getEnabledPaymentMethods } from '@/lib/payments'

export const metadata = { title: '注文フォーム — Memorial Items' }

export default function OrderPage() {
  const enabledMethods = getEnabledPaymentMethods()
  const bankAccount = getBankTransferAccount()

  return (
    <>
      <Nav />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">注文フォーム</h1>
        <p className="text-gray-600 mb-8">
          必要事項を入力し、ペットの写真（3〜5枚）を送信してください。初稿ができましたらメールでご案内します。
        </p>
        <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          <p className="font-medium text-gray-900 mb-2">ご注文前の確認事項</p>
          <ul className="space-y-1">
            <li>・提供内容: {businessInfo.productSummary}</li>
            <li>・支払い方法: {businessInfo.paymentMethods.join(' / ')}</li>
            <li>・納品目安: {businessInfo.deliveryLeadTime}</li>
            <li>・返金方針: {businessInfo.refundSummary}</li>
          </ul>
        </div>
        <OrderForm enabledMethods={enabledMethods} bankAccount={bankAccount} />
      </main>
      <Footer />
    </>
  )
}
