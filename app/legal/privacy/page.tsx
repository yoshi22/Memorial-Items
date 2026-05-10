import { LegalPageShell } from '@/components/common/LegalPageShell'
import { businessInfo } from '@/lib/public-business'
import { isCreditCardEnabled, isPayPayEnabled } from '@/lib/payments'

export const metadata = {
  title: `プライバシーポリシー — ${businessInfo.serviceName}`,
}

export default function PrivacyPage() {
  const thirdPartyServices = ['Brevo', 'Supabase', 'Vercel']
  if (isPayPayEnabled()) thirdPartyServices.push('PayPay')
  if (isCreditCardEnabled()) thirdPartyServices.push('Stripe')

  return (
    <LegalPageShell
      title="プライバシーポリシー"
      description="ご注文、お問い合わせ、制作進行に伴って取得する情報の取扱いについて定めています。"
    >
      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink mb-3">取得する情報</h2>
        <p>氏名、メールアドレス、ペット名、注文内容、アップロード画像、決済状況、お問い合わせ内容などを取得します。</p>
      </section>
      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink mb-3">利用目的</h2>
        <p>注文受付、制作進行、顧客連絡、proof 確認、納品、サポート対応、不正利用防止、サービス改善のために利用します。</p>
      </section>
      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink mb-3">第三者提供</h2>
        <p>メール送信、インフラ運用に必要な範囲で、{thirdPartyServices.join('、')} などの委託先を利用します。</p>
      </section>
      <section className="rounded-2xl border border-line bg-surface p-6">
        <h2 className="font-semibold text-ink mb-3">問い合わせ窓口</h2>
        <p>個人情報に関するお問い合わせは {businessInfo.contactEmail} までご連絡ください。</p>
        <p>{businessInfo.legalNotice}</p>
      </section>
    </LegalPageShell>
  )
}
