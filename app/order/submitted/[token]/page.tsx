import Link from 'next/link'
import { Nav } from '@/components/common/Nav'
import { Footer } from '@/components/common/Footer'
import { createAdminClient } from '@/lib/supabase/admin'
import { businessInfo } from '@/lib/public-business'
import { getBankTransferAccount } from '@/lib/payments'
import { PaymentInstructions } from '@/components/order/PaymentInstructions'

export const dynamic = 'force-dynamic'

export default async function OrderSubmittedPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const admin = createAdminClient()
  const { data: order } = await admin
    .from('orders')
    .select('customer_name, pet_name, payment_method')
    .eq('public_order_token', token)
    .single()

  const bankAccount = getBankTransferAccount()

  if (!order) {
    return (
      <>
        <Nav />
        <main className="flex-1 max-w-2xl mx-auto px-4 py-20 text-center">
          <p className="text-gray-600">注文が見つかりません。</p>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Nav />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-6">🎨</div>
        <h1 className="text-3xl font-bold mb-3">ご注文ありがとうございます！</h1>
        <p className="text-gray-600 mb-6">
          {order.customer_name} 様、{order.pet_name} の額装アートのご注文を承りました。
          <br />
          ご注文内容の確認リンクと今後のご案内をメールでお送りします。
        </p>

        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-left">
          <p className="text-sm font-medium text-gray-900 mb-2">受付後のご案内</p>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>・進行状況の確認リンクはメールからご利用ください</li>
            <li>・ステータス更新時にはメールでご案内します</li>
            <li>・proof の確認や修正依頼もメールのリンクから進めてください</li>
            <li>・完成画像は最終承認後にダウンロード形式でご案内します</li>
          </ul>
        </div>

        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 text-left">
          <p className="text-sm font-medium text-gray-900 mb-2">ご利用条件</p>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>・納品目安: {businessInfo.deliveryLeadTime}</li>
            <li>・返金方針: {businessInfo.refundSummary}</li>
            <li>・お問い合わせ: {businessInfo.contactEmail}</li>
          </ul>
        </div>

        <PaymentInstructions
          paymentMethod={order.payment_method}
          petName={order.pet_name}
          bankAccount={bankAccount}
          variant="success"
        />

        <Link href="/" className="inline-block rounded-md bg-gray-900 px-6 py-2.5 text-white hover:bg-gray-700">
          トップページへ戻る
        </Link>
      </main>
      <Footer />
    </>
  )
}
