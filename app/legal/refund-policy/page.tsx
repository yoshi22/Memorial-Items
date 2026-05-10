import { LegalPageShell } from '@/components/common/LegalPageShell'
import { businessInfo } from '@/lib/public-business'

export const metadata = {
  title: `返金・キャンセルポリシー — ${businessInfo.serviceName}`,
}

export default function RefundPolicyPage() {
  return (
    <LegalPageShell
      title="返金・キャンセルポリシー"
      description="注文確定後のキャンセル、制作開始後の返金、修正対応の考え方を掲載しています。"
    >
      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink mb-3">キャンセルについて</h2>
        <p>{businessInfo.cancellationSummary}</p>
      </section>
      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink mb-3">返金について</h2>
        <p>{businessInfo.refundSummary}</p>
      </section>
      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink mb-3">修正対応について</h2>
        <p>{businessInfo.revisionSummary}</p>
        <p>制作意図と大きく異なる内容や、元素材に存在しない追加要望は別途ご相談になる場合があります。</p>
      </section>
    </LegalPageShell>
  )
}
