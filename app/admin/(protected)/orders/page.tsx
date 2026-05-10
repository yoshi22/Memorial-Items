import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/admin/OrderStatusBadge'
import type { OrderStatus } from '@/lib/supabase/types'
import { ORDER_STATUS_LABELS, getStyleLabel, getSizeLabel } from '@/lib/variants'
import { formatDateTime } from '@/lib/utils'
import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'

const PHYSICAL_SHIPPING_STATUSES = new Set(['in_production', 'shipped', 'completed'])

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const admin = createAdminClient()

  const statusFilters: { value: string; label: string }[] = [
    { value: '', label: 'すべて' },
    ...Object.entries(ORDER_STATUS_LABELS)
      .filter(([value]) => env.enablePhysicalShipping || !PHYSICAL_SHIPPING_STATUSES.has(value))
      .map(([value, label]) => ({ value, label })),
  ]

  let query = admin
    .from('orders')
    .select('id, customer_name, pet_name, style, size, status, payment_status, created_at')
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status as OrderStatus)
  }

  const { data: orders } = await query

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">注文一覧</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {statusFilters.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/admin/orders?status=${f.value}` : '/admin/orders'}
            className={`rounded-full px-3 py-1 text-sm ${
              (status ?? '') === f.value
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>日時</TableHead>
              <TableHead>お客様</TableHead>
              <TableHead>ペット</TableHead>
              <TableHead>仕様</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>支払い</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders && orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="text-xs text-gray-500">{formatDateTime(order.created_at)}</TableCell>
                  <TableCell className="font-medium">{order.customer_name}</TableCell>
                  <TableCell>{order.pet_name}</TableCell>
                  <TableCell className="text-sm text-gray-600">{getStyleLabel(order.style)} / {getSizeLabel(order.size)}</TableCell>
                  <TableCell><OrderStatusBadge status={order.status} /></TableCell>
                  <TableCell><PaymentStatusBadge status={order.payment_status} /></TableCell>
                  <TableCell>
                    <Link href={`/admin/orders/${order.id}`} className="text-sm text-gray-600 hover:text-gray-900 underline">
                      詳細
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-10">
                  注文がありません
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
