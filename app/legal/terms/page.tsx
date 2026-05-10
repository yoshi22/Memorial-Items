import { LegalPageShell } from '@/components/common/LegalPageShell'
import { businessInfo } from '@/lib/public-business'

export const metadata = {
  title: `利用規約 — ${businessInfo.serviceName}`,
}

export default function TermsPage() {
  return (
    <LegalPageShell
      title="利用規約"
      description="Memorial Items の注文、制作、納品に関する基本条件を定めています。"
    >
      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink mb-3">サービス内容</h2>
        <p>{businessInfo.productSummary}</p>
        <p>注文内容に応じて制作者が手作業で仕上げ、顧客確認用 proof を提示した後に最終データを納品します。</p>
      </section>
      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink mb-3">注文と支払い</h2>
        <p>注文成立後、当社が案内する決済方法に従ってお支払いください。支払い確認後に制作を進めます。</p>
      </section>
      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink mb-3">修正と納品</h2>
        <p>{businessInfo.revisionSummary}</p>
        <p>{businessInfo.finalDelivery}</p>
      </section>
      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink mb-3">禁止事項</h2>
        <p>第三者の権利を侵害する素材の送付、不正利用、なりすまし、サービス運営を妨げる行為を禁止します。</p>
      </section>
    </LegalPageShell>
  )
}
