import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createSignedUrl } from '@/lib/storage'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/admin/OrderStatusBadge'
import { AdminOrderActions } from '@/components/admin/AdminOrderActions'
import {
  AdminNotesSection,
  CustomerImagesSection,
  CustomerInfoSection,
  OrderSpecSection,
  PrintMasterSection,
  ProofsSection,
  RevisionHistorySection,
} from '@/components/admin/OrderDetailSections'
import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: order } = await admin.from('orders').select('*').eq('id', id).single()
  if (!order) notFound()

  const [
    { data: images },
    { data: proofs },
    { data: revisions },
    { data: artAssets },
    { data: notes },
  ] = await Promise.all([
    admin.from('order_images').select('*').eq('order_id', id).order('sort_order'),
    admin.from('proofs').select('*').eq('order_id', id).order('version', { ascending: false }),
    admin.from('revision_requests').select('*').eq('order_id', id).order('created_at', { ascending: false }),
    admin.from('art_assets').select('*').eq('order_id', id).order('created_at', { ascending: false }),
    admin.from('admin_notes').select('*').eq('order_id', id).order('created_at', { ascending: false }),
  ])

  const signedImages = await Promise.all(
    (images ?? []).map(async (img) => {
      try { return { ...img, signedUrl: await createSignedUrl('customer-uploads', img.file_path, 3600) } }
      catch { return { ...img, signedUrl: null } }
    }),
  )

  const signedProofs = await Promise.all(
    (proofs ?? []).map(async (p) => {
      try { return { ...p, signedUrl: await createSignedUrl('proofs', p.proof_image_url, 3600) } }
      catch { return { ...p, signedUrl: p.proof_image_url } }
    }),
  )

  const printMasters = (artAssets ?? []).filter((a) => a.asset_type === 'print_master')
  const isApproved = order.status === 'approved' || order.status === 'in_production' || order.status === 'shipped' || order.status === 'completed'
  const { enablePhysicalShipping } = env

  const customerOrderUrl = `${env.appBaseUrl}/o/${order.public_order_token}`
  const proofUrl = `${env.appBaseUrl}/p/${order.public_proof_token}`

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/orders" className="text-sm text-gray-500 hover:text-gray-900">← 一覧</Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold">{order.pet_name}（{order.customer_name}）</h1>
        <OrderStatusBadge status={order.status} />
        <PaymentStatusBadge status={order.payment_status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left main */}
        <div className="lg:col-span-2 space-y-6">
          <CustomerInfoSection order={order} customerOrderUrl={customerOrderUrl} proofUrl={proofUrl} />
          <OrderSpecSection order={order} />
          <CustomerImagesSection images={signedImages} />
          <ProofsSection orderId={id} proofs={signedProofs} />
          <RevisionHistorySection revisions={revisions ?? []} />

          {/* Print Master (物理配送有効時のみ表示) */}
          {enablePhysicalShipping && (
            <PrintMasterSection orderId={id} isApproved={isApproved} printMasters={printMasters} />
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <section className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="font-semibold mb-4">操作</h2>
            <AdminOrderActions
              orderId={id}
              currentStatus={order.status}
              currentPayment={order.payment_status}
              enablePhysicalShipping={enablePhysicalShipping}
            />
          </section>

          {/* Admin Notes */}
          <AdminNotesSection notes={notes ?? []} />
        </div>
      </div>
    </div>
  )
}
