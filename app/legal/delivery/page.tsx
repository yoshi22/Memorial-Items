import { LegalPageShell } from '@/components/common/LegalPageShell'
import { businessInfo } from '@/lib/public-business'

export const metadata = {
  title: `納品ポリシー — ${businessInfo.serviceName}`,
}

export default function DeliveryPage() {
  return (
    <LegalPageShell
      title="納品ポリシー"
      description="制作開始から proof 提示、修正、最終納品までの目安と提供形式を掲載しています。"
    >
      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink mb-3">提供内容</h2>
        <p>{businessInfo.productSummary}</p>
      </section>
      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink mb-3">制作スケジュール</h2>
        <p>{businessInfo.deliveryLeadTime}</p>
        <p>修正依頼の内容や混雑状況により前後する場合があります。</p>
      </section>
      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink mb-3">最終納品形式</h2>
        <p>{businessInfo.finalDelivery}</p>
        <p>{businessInfo.shippingPolicy}</p>
      </section>
    </LegalPageShell>
  )
}
