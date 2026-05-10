import { getEnabledPaymentMethods } from './payments'

export const businessInfo = {
  serviceName: 'Memorial Items',
  legalEntityName: '請求があった場合、遅滞なく開示します。',
  representative: '請求があった場合、遅滞なく開示します。',
  address: '請求があった場合、遅滞なく開示します。',
  contactEmail: 'yoshi.mario.developer@gmail.com',
  contactHours: '平日 10:00-18:00（土日祝除く）',
  responseTime: '通常 2 営業日以内に返信します。',
  supportMethod: 'お問い合わせフォームまたはメール',
  productSummary: 'ペット写真をもとに制作するカスタムメモリアルアートのデジタル納品サービス',
  pricingSummary: '価格は商品サイズやオプションに応じてご案内します。表示価格は税込です。',
  get paymentMethods() {
    return getEnabledPaymentMethods().map((m) => m.label)
  },
  paymentTiming: 'ご注文受付メールにてお支払い案内をご送付します。ご入金確認後に制作を開始します。',
  deliveryLeadTime: '通常はご入金確認後 5 営業日以内に初稿をご案内します。',
  finalDelivery: '最終承認後、完成画像をダウンロード形式で納品します。',
  shippingPolicy: '物理額装と発送は現在個別案内または準備中の扱いです。',
  refundSummary: '制作開始後の返金は原則不可です。制作開始前のキャンセルは個別に確認します。',
  cancellationSummary: '制作開始前はキャンセル相談可、制作開始後は対応済み工数を踏まえて判断します。',
  revisionSummary: '初稿確認後に修正依頼を受け付け、内容に応じて再提示します。',
  legalNotice:
    '販売事業者、運営責任者、所在地の開示請求は、上記連絡先メールアドレスまでご連絡ください。請求があった場合、遅滞なく開示します。',
}

export const footerLegalLinks = [
  { href: '/contact', label: 'お問い合わせ' },
  { href: '/legal/commerce', label: '特商法表記' },
  { href: '/legal/terms', label: '利用規約' },
  { href: '/legal/privacy', label: 'プライバシーポリシー' },
  { href: '/legal/refund-policy', label: '返金・キャンセル' },
  { href: '/legal/delivery', label: '納品ポリシー' },
]
