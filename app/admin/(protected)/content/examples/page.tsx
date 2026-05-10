import { createAdminClient } from '@/lib/supabase/admin'
import { ExamplesManager } from './ExamplesManager'

export const dynamic = 'force-dynamic'

export default async function AdminExamplesPage() {
  const admin = createAdminClient()
  const { data: items } = await admin.from('content_examples').select('*').order('sort_order')

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">作例管理</h1>
      <ExamplesManager initialItems={items ?? []} />
    </div>
  )
}
