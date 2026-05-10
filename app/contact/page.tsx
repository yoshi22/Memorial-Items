import { LegalPageShell } from '@/components/common/LegalPageShell'
import { businessInfo } from '@/lib/public-business'

export const metadata = {
  title: `お問い合わせ — ${businessInfo.serviceName}`,
}

export default function ContactPage() {
  return (
    <LegalPageShell
      title="お問い合わせ"
      description="ご注文前の確認、ご注文後の進行確認、修正依頼、ポリシーに関するお問い合わせを受け付けています。"
    >
      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink mb-3">連絡先</h2>
        <p>サービス名: {businessInfo.serviceName}</p>
        <p>問い合わせ方法: {businessInfo.supportMethod}</p>
        <p>メール: {businessInfo.contactEmail}</p>
        <p>受付時間: {businessInfo.contactHours}</p>
        <p>返信目安: {businessInfo.responseTime}</p>
      </section>
      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink mb-3">ご連絡時に含めていただきたい情報</h2>
        <ul className="space-y-1">
          <li>ご注文前: 確認したい内容</li>
          <li>ご注文後: 注文時のメールアドレス、ペット名、確認したい内容</li>
          <li>修正依頼: proof 確認ページの修正依頼フォームからお送りください</li>
        </ul>
        <p>{businessInfo.legalNotice}</p>
      </section>
    </LegalPageShell>
  )
}
