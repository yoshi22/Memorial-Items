import { ProofUploader } from '@/components/admin/ProofUploader'
import { PrintMasterUploader } from '@/components/admin/PrintMasterUploader'
import { getFrameLabel, getPaymentMethodLabel, getSizeLabel, getStyleLabel } from '@/lib/variants'
import { formatDateTime } from '@/lib/utils'
import type { AdminNote, ArtAsset, Order, OrderImage, Proof, RevisionRequest } from '@/lib/supabase/types'

export type SignedOrderImage = OrderImage & { signedUrl: string | null }
export type SignedProof = Proof & { signedUrl: string | null }

export function CustomerInfoSection({
  order,
  customerOrderUrl,
  proofUrl,
}: {
  order: Order
  customerOrderUrl: string
  proofUrl: string
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="font-semibold mb-3">顧客情報</h2>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-gray-500">名前</dt><dd>{order.customer_name}</dd>
        <dt className="text-gray-500">メール</dt>
        <dd><a href={`mailto:${order.customer_email}`} className="underline">{order.customer_email}</a></dd>
        <dt className="text-gray-500">受注日</dt><dd>{formatDateTime(order.created_at)}</dd>
      </dl>
      <div className="mt-3 flex gap-3 text-xs text-gray-500">
        <a href={customerOrderUrl} target="_blank" rel="noopener noreferrer" className="underline">注文詳細URL</a>
        <a href={proofUrl} target="_blank" rel="noopener noreferrer" className="underline">proof確認URL</a>
      </div>
    </section>
  )
}

export function OrderSpecSection({ order }: { order: Order }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="font-semibold mb-3">注文仕様</h2>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-gray-500">スタイル</dt><dd>{getStyleLabel(order.style)}</dd>
        <dt className="text-gray-500">サイズ</dt><dd>{getSizeLabel(order.size)}</dd>
        <dt className="text-gray-500">フレーム</dt><dd>{getFrameLabel(order.frame)}</dd>
        <dt className="text-gray-500">支払い方法</dt><dd>{getPaymentMethodLabel(order.payment_method)}</dd>
      </dl>
      {order.must_keep_features && (
        <div className="mt-4 border-t pt-3">
          <p className="text-xs text-gray-500 mb-1">必ず残してほしい特徴</p>
          <p className="text-sm whitespace-pre-wrap font-medium">{order.must_keep_features}</p>
        </div>
      )}
      {order.notes && (
        <div className="mt-3 border-t pt-3">
          <p className="text-xs text-gray-500 mb-1">備考</p>
          <p className="text-sm whitespace-pre-wrap">{order.notes}</p>
        </div>
      )}
    </section>
  )
}

export function CustomerImagesSection({ images }: { images: SignedOrderImage[] }) {
  if (images.length === 0) return null

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="font-semibold mb-3">顧客写真（{images.length}枚）</h2>
      <div className="flex flex-wrap gap-3">
        {images.map((img) =>
          img.signedUrl ? (
            <a key={img.id} href={img.signedUrl} target="_blank" rel="noopener noreferrer">
              <img src={img.signedUrl} alt="" className="h-28 w-28 object-cover rounded border border-gray-200" />
            </a>
          ) : null,
        )}
      </div>
    </section>
  )
}

export function ProofsSection({ orderId, proofs }: { orderId: string; proofs: SignedProof[] }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Proof 管理</h2>
        <ProofUploader orderId={orderId} />
      </div>
      {proofs.length > 0 ? (
        <div className="space-y-4">
          {proofs.map((p) => (
            <div key={p.id} className="border border-gray-100 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between bg-gray-50 px-3 py-2">
                <span className="text-sm font-medium">{p.version === 1 ? '初稿 v1' : `修正版 v${p.version}`}</span>
                <span className="text-xs text-gray-500">{formatDateTime(p.created_at)}</span>
              </div>
              {p.signedUrl && (
                <a href={p.signedUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <img src={p.signedUrl} alt={`proof v${p.version}`} className="max-h-64 object-contain mx-auto p-2" />
                </a>
              )}
              {p.production_notes && (
                <div className="px-3 pb-3 text-xs text-gray-600 whitespace-pre-wrap">{p.production_notes}</div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">まだ proof がありません</p>
      )}
    </section>
  )
}

export function RevisionHistorySection({ revisions }: { revisions: RevisionRequest[] }) {
  if (revisions.length === 0) return null

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="font-semibold mb-3">修正依頼履歴</h2>
      <div className="space-y-3">
        {revisions.map((r) => (
          <div key={r.id} className="rounded border border-yellow-100 bg-yellow-50 p-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{formatDateTime(r.created_at)}</span>
              <span>{r.status}</span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{r.request_text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function PrintMasterSection({
  orderId,
  isApproved,
  printMasters,
}: {
  orderId: string
  isApproved: boolean
  printMasters: ArtAsset[]
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="font-semibold mb-3">Print Master</h2>
      <PrintMasterUploader orderId={orderId} isApproved={isApproved} />
      {printMasters.length > 0 && (
        <div className="mt-3 space-y-1">
          {printMasters.map((a) => (
            <div key={a.id} className="text-xs text-gray-600 flex items-center gap-2">
              <span>✓</span>
              <span>{formatDateTime(a.created_at)}</span>
              <span className="font-mono truncate">{a.file_url}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export function AdminNotesSection({ notes }: { notes: AdminNote[] }) {
  if (notes.length === 0) return null

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="font-semibold mb-3">管理者メモ</h2>
      <div className="space-y-2">
        {notes.map((n) => (
          <div key={n.id} className="rounded bg-gray-50 p-3 text-sm">
            <p className="whitespace-pre-wrap">{n.note}</p>
            <p className="text-xs text-gray-400 mt-1">{n.created_by} · {formatDateTime(n.created_at)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
