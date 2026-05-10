import Image from 'next/image'
import { Nav } from '@/components/common/Nav'
import { Footer } from '@/components/common/Footer'
import { createClient } from '@/lib/supabase/server'
import { trackServer } from '@/lib/analytics'
import type { ContentExample } from '@/lib/supabase/types'
import { STATIC_EXAMPLES } from '@/lib/static-examples'

export const dynamic = 'force-dynamic'

export const metadata = { title: '作例 — Memorial Items' }

export default async function ExamplesPage() {
  await trackServer('examples_viewed')
  const supabase = await createClient()
  const { data: dbExamples } = await supabase
    .from('content_examples')
    .select('*')
    .eq('is_published', true)
    .order('sort_order')

  const examples: ContentExample[] = dbExamples && dbExamples.length > 0 ? dbExamples : STATIC_EXAMPLES

  return (
    <>
      <Nav />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">作例</h1>
        <p className="text-gray-600 mb-10">これまでにお届けした作品の一部をご紹介します。</p>

        {examples && examples.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {examples.map((ex: ContentExample) => (
              <div key={ex.id} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                <div className="aspect-square relative bg-gray-100">
                  <Image
                    src={ex.image_url}
                    alt={ex.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <p className="font-medium">{ex.title}</p>
                  {ex.short_description && (
                    <p className="text-sm text-gray-500 mt-1">{ex.short_description}</p>
                  )}
                  {ex.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {ex.tags.map((tag: string) => (
                        <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">作例は準備中です。</p>
        )}
      </main>
      <Footer />
    </>
  )
}
