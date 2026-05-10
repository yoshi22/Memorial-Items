import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Nav } from '@/components/common/Nav'
import { Footer } from '@/components/common/Footer'
import { createAdminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/badge'
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, getFrameLabel, getPaymentMethodLabel, getSizeLabel, getStyleLabel } from '@/lib/variants'
import { formatDateTime } from '@/lib/utils'
import { env } from '@/lib/env'
import { getBankTransferAccount } from '@/lib/payments'
import { PaymentInstructions } from '@/components/order/PaymentInstructions'

export const dynamic = 'force-dynamic'

export default async function OrderDetailPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const admin = createAdminClient()

  const { data: order } = await admin
    .from('orders')
    .select('*')
    .eq('public_order_token', token)
    .single()

  if (!order) notFound()

  const { data: proofs } = await admin
    .from('proofs')
    .select('*')
    .eq('order_id', order.id)
    .order('version', { ascending: false })

  const latestProof = proofs && proofs.length > 0 ? proofs[0] : null
  const { enablePhysicalShipping } = env
  const bankAccount = getBankTransferAccount()

  return (
    <>
      <Nav />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{order.pet_name} の注文</h1>
            <p className="text-sm text-gray-500 mt-1">注文日: {formatDateTime(order.created_at)}</p>
          </div>
          <div className="flex flex-col gap-1.5 items-end">
            <Badge variant="secondary">{ORDER_STATUS_LABELS[order.status] ?? order.status}</Badge>
            <Badge variant="outline">{PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status}</Badge>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 mb-6">
          <h2 className="font-semibold mb-3">注文内容</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <dt className="text-gray-500">スタイル</dt><dd>{getStyleLabel(order.style)}</dd>
            <dt className="text-gray-500">サイズ</dt><dd>{getSizeLabel(order.size)}</dd>
            <dt className="text-gray-500">フレーム</dt><dd>{getFrameLabel(order.frame)}</dd>
            <dt className="text-gray-500">支払い方法</dt><dd>{getPaymentMethodLabel(order.payment_method)}</dd>
          </dl>
          {order.must_keep_features && (
            <div className="mt-4 border-t pt-3">
              <p className="text-xs text-gray-500 mb-1">必ず残してほしい特徴</p>
              <p className="text-sm whitespace-pre-wrap">{order.must_keep_features}</p>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 mb-6">
          <h2 className="font-semibold mb-3">このページについて</h2>
          <p className="text-sm text-gray-600">
            プライバシー保護のため、この公開リンクでは送付写真を表示していません。
            進行状況の確認と proof のご案内のみにご利用ください。
          </p>
        </div>

        {latestProof && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">初稿（バージョン {latestProof.version}）</h2>
              {(order.status === 'proof_uploaded' || order.status === 'revision_requested') && (
                <Link
                  href={`/p/${order.public_proof_token}`}
                  className="rounded-md bg-gray-900 px-4 py-1.5 text-sm text-white hover:bg-gray-700"
                >
                  確認・承認へ
                </Link>
              )}
            </div>
            {order.status === 'approved' && (
              <p className="text-sm text-green-700 font-medium">✓ 承認済み</p>
            )}
            {order.status === 'approved' && !enablePhysicalShipping && latestProof && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm font-medium mb-2">完成画像のダウンロード</p>
                <a
                  href={`/api/storage/proofs/${latestProof.proof_image_url}?token=${order.public_order_token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
                >
                  完成画像を開く・保存する
                </a>
                <p className="text-xs text-gray-500 mt-1">リンクは一時的なものです。お早めに保存してください。</p>
              </div>
            )}
            {order.status === 'revision_requested' && (
              <p className="text-sm text-yellow-700 font-medium">修正依頼を受け付けました。対応後に再度ご確認いただけます。</p>
            )}
          </div>
        )}

        {order.payment_status !== 'paid' && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 mb-6">
            <h2 className="font-semibold mb-2">お支払い案内</h2>
            <p className="text-sm text-gray-600 mb-3">選択されたお支払い方法: {getPaymentMethodLabel(order.payment_method)}</p>
            <PaymentInstructions
              paymentMethod={order.payment_method}
              petName={order.pet_name}
              bankAccount={bankAccount}
              variant="pending"
            />
          </div>
        )}

        {enablePhysicalShipping && order.tracking_number && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="font-semibold mb-2">発送情報</h2>
            <p className="text-sm">追跡番号: <span className="font-mono">{order.tracking_number}</span></p>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
