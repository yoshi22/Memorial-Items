import type { FaqItem } from '@/lib/supabase/types'
import { isBankTransferEnabled, isPayPayEnabled } from '@/lib/payments'

type PublicFaqSeed = Pick<FaqItem, 'question' | 'answer' | 'sort_order' | 'is_published'>

function getPublicPaymentSummary() {
  const methods: string[] = []

  if (isBankTransferEnabled()) methods.push('銀行振込')
  if (isPayPayEnabled()) methods.push('PayPay')

  return methods.length > 0 ? methods.join(' / ') : 'ご注文受付後に個別案内'
}

export function getFallbackFaqItems(): PublicFaqSeed[] {
  return [
    {
      question: 'どんな写真を送ればよいですか？',
      answer:
        '顔がはっきり見え、目・毛色・模様が分かる写真を3〜5枚ほどご用意ください。正面または斜め前からの写真がおすすめです。',
      sort_order: 10,
      is_published: true,
    },
    {
      question: '注文後はどのように進みますか？',
      answer:
        'ご注文とご入金確認後に制作を開始し、通常は5営業日以内に初稿をご案内します。初稿確認後に必要であれば修正対応を行い、ご承認後に完成画像をダウンロード形式で納品します。',
      sort_order: 20,
      is_published: true,
    },
    {
      question: '仕上がりは事前に確認できますか？',
      answer:
        'はい。完成前に初稿をご確認いただけます。気になる点があれば修正依頼をお送りいただき、調整後のproofを再案内します。',
      sort_order: 30,
      is_published: true,
    },
    {
      question: '修正は何回までお願いできますか？',
      answer:
        '標準では最大2回までを目安に修正を承っています。大幅な作り直しではなく、表情・毛色・模様など気になる点の調整を想定しています。',
      sort_order: 40,
      is_published: true,
    },
    {
      question: '納品はどのような形ですか？',
      answer:
        '現時点のMVPでは、最終承認後に完成画像をダウンロード形式で納品します。物理額装や発送は現在の通常導線には含まれていません。',
      sort_order: 50,
      is_published: true,
    },
    {
      question: '支払い方法を教えてください。',
      answer: `現在ご案内している支払い方法は ${getPublicPaymentSummary()} です。詳細はご注文受付後のメールでご案内します。`,
      sort_order: 60,
      is_published: true,
    },
    {
      question: 'キャンセルや返金はできますか？',
      answer:
        '制作開始前のキャンセルは個別に確認します。制作開始後の返金は原則不可ですが、進行状況を踏まえて個別にご案内します。',
      sort_order: 70,
      is_published: true,
    },
  ]
}

export function getPublicFaqItems(items: FaqItem[] | null | undefined): PublicFaqSeed[] {
  if (items && items.length > 0) {
    return items
      .filter((item) => item.is_published)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(({ question, answer, sort_order, is_published }) => ({
        question,
        answer,
        sort_order,
        is_published,
      }))
  }

  return getFallbackFaqItems()
}
