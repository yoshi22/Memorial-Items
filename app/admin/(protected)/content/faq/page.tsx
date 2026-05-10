import { createAdminClient } from '@/lib/supabase/admin'
import { FaqManager } from './FaqManager'

export const dynamic = 'force-dynamic'

export default async function AdminFaqPage() {
  const admin = createAdminClient()
  const { data: items } = await admin.from('faq_items').select('*').order('sort_order')

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">FAQ 管理</h1>
      <FaqManager initialItems={items ?? []} />
    </div>
  )
}
