import { Nav } from '@/components/common/Nav'
import { Footer } from '@/components/common/Footer'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { businessInfo } from '@/lib/public-business'
import { getPublicFaqItems } from '@/lib/public-content'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'よくある質問 — Memorial Items' }

export default async function FaqPage() {
  const supabase = await createClient()
  const { data: items } = await supabase
    .from('faq_items')
    .select('*')
    .eq('is_published', true)
    .order('sort_order')

  const publicFaqItems = getPublicFaqItems(items)

  return (
    <>
      <Nav />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">よくある質問</h1>
        <p className="text-gray-600 mb-10">ご不明な点がございましたら <a className="underline" href={`mailto:${businessInfo.contactEmail}`}>{businessInfo.contactEmail}</a> までご連絡ください。</p>

        <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h2 className="font-semibold text-gray-900 mb-2">サービスの概要</h2>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>・提供内容: {businessInfo.productSummary}</li>
            <li>・支払い方法: {businessInfo.paymentMethods.join(' / ')}</li>
            <li>・納品目安: {businessInfo.deliveryLeadTime}</li>
            <li>・返金方針: {businessInfo.refundSummary}</li>
          </ul>
        </div>

        {publicFaqItems.length > 0 ? (
          <div className="space-y-6">
            {publicFaqItems.map((item) => (
              <div key={`${item.sort_order}-${item.question}`} className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="font-semibold text-gray-900 mb-2">Q. {item.question}</h2>
                <p className="text-gray-700 text-sm leading-relaxed">A. {item.answer}</p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-12 text-center">
          <Link href="/order" className="rounded-md bg-gray-900 px-6 py-3 text-white hover:bg-gray-700 inline-block">
            注文する
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
