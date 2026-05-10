import { LegalPageShell } from '@/components/common/LegalPageShell'
import { businessInfo } from '@/lib/public-business'

export const metadata = {
  title: `特定商取引法に基づく表記 — ${businessInfo.serviceName}`,
}

export default function CommercePage() {
  return (
    <LegalPageShell
      title="特定商取引法に基づく表記"
      description="オンライン受注に関する事業者情報、販売条件、納品条件を掲載しています。"
    >
      <section className="rounded-2xl border border-line bg-surface p-6">
        <p>販売事業者: {businessInfo.legalEntityName}</p>
        <p>運営責任者: {businessInfo.representative}</p>
        <p>所在地: {businessInfo.address}</p>
        <p>連絡先メールアドレス: {businessInfo.contactEmail}</p>
        <p>受付時間: {businessInfo.contactHours}</p>
      </section>
      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink mb-3">販売価格</h2>
        <p>{businessInfo.pricingSummary}</p>
        <p>追加費用が発生する場合は、注文時または事前案内時に明示します。</p>
      </section>
      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink mb-3">支払い方法と支払い時期</h2>
        <p>支払い方法: {businessInfo.paymentMethods.join(' / ')}</p>
        <p>{businessInfo.paymentTiming}</p>
      </section>
      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink mb-3">納品時期</h2>
        <p>{businessInfo.deliveryLeadTime}</p>
        <p>{businessInfo.finalDelivery}</p>
        <p>{businessInfo.shippingPolicy}</p>
      </section>
      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink mb-3">返品・キャンセル</h2>
        <p>{businessInfo.refundSummary}</p>
        <p>{businessInfo.cancellationSummary}</p>
        <p>{businessInfo.revisionSummary}</p>
        <p>{businessInfo.legalNotice}</p>
      </section>
    </LegalPageShell>
  )
}
