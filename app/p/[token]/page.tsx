import { notFound } from 'next/navigation'
import { Nav } from '@/components/common/Nav'
import { Footer } from '@/components/common/Footer'
import { createAdminClient } from '@/lib/supabase/admin'
import { createSignedUrl } from '@/lib/storage'
import { ProofReviewActions } from '@/components/proof/ProofReviewActions'
import { trackServer } from '@/lib/analytics'
import { formatDateTime } from '@/lib/utils'
import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'

export default async function ProofReviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const admin = createAdminClient()

  const { data: order } = await admin
    .from('orders')
    .select('*')
    .eq('public_proof_token', token)
    .single()

  if (!order) notFound()

  await trackServer('proof_viewed', { order_id: order.id })

  const { data: proofs } = await admin
    .from('proofs')
    .select('*')
    .eq('order_id', order.id)
    .order('version', { ascending: false })

  const latestProof = proofs?.[0] ?? null

  const { data: revisions } = await admin
    .from('revision_requests')
    .select('*')
    .eq('order_id', order.id)
    .order('created_at', { ascending: false })

  let proofSignedUrl: string | null = null
  if (latestProof) {
    try {
      proofSignedUrl = await createSignedUrl('proofs', latestProof.proof_image_url, 3600)
    } catch {
      // fallback to stored URL if already signed/public
      proofSignedUrl = latestProof.proof_image_url
    }
  }

  const isApproved = order.status === 'approved' || order.status === 'in_production' || order.status === 'shipped' || order.status === 'completed'
  const { enablePhysicalShipping } = env

  return (
    <>
      <Nav />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-1">{order.pet_name} の初稿確認</h1>
        <p className="text-sm text-gray-500 mb-8">内容をご確認のうえ、承認または修正依頼をお送りください。</p>

        {latestProof ? (
          <>
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden mb-6">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium">バージョン {latestProof.version}</span>
                <span className="text-xs text-gray-500">{formatDateTime(latestProof.created_at)}</span>
              </div>
              {proofSignedUrl && (
                <div className="p-4">
                  <img
                    src={proofSignedUrl}
                    alt={`${order.pet_name} 初稿 v${latestProof.version}`}
                    className="w-full rounded"
                  />
                </div>
              )}
              {latestProof.production_notes && (
                <div className="p-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">制作メモ</p>
                  <p className="text-sm whitespace-pre-wrap">{latestProof.production_notes}</p>
                </div>
              )}
            </div>

            <ProofReviewActions
              proofToken={token}
              proofId={latestProof.id}
              isApproved={isApproved}
              enablePhysicalShipping={enablePhysicalShipping}
            />

            {revisions && revisions.length > 0 && (
              <div className="mt-8">
                <h2 className="font-semibold mb-3">修正依頼の履歴</h2>
                <div className="space-y-3">
                  {revisions.map((r) => (
                    <div key={r.id} className="rounded border border-gray-200 bg-gray-50 p-3">
                      <p className="text-xs text-gray-500 mb-1">{formatDateTime(r.created_at)}</p>
                      <p className="text-sm whitespace-pre-wrap">{r.request_text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-600">初稿の準備ができましたらメールでご連絡します。</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
