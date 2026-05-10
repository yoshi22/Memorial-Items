'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateStatus, updatePayment, updateTracking, addAdminNote } from '@/app/admin/orders/[id]/actions'
import type { OrderStatus, PaymentStatus } from '@/lib/supabase/types'
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/variants'

const PHYSICAL_SHIPPING_STATUSES = new Set(['in_production', 'shipped', 'completed'])
const PAYMENT_STATUSES = Object.entries(PAYMENT_STATUS_LABELS) as [PaymentStatus, string][]

interface Props {
  orderId: string
  currentStatus: OrderStatus
  currentPayment: PaymentStatus
  enablePhysicalShipping: boolean
}

export function AdminOrderActions({ orderId, currentStatus, currentPayment, enablePhysicalShipping }: Props) {
  const orderStatuses = (Object.entries(ORDER_STATUS_LABELS) as [OrderStatus, string][]).filter(
    ([val]) => enablePhysicalShipping || !PHYSICAL_SHIPPING_STATUSES.has(val),
  )
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState('')

  function run(fn: () => Promise<{ error?: string }>) {
    setMessage('')
    startTransition(async () => {
      const r = await fn()
      if (r.error) setMessage(`エラー: ${r.error}`)
      else setMessage('更新しました')
    })
  }

  return (
    <div className="space-y-6">
      {message && <p className="text-sm text-gray-700 bg-gray-50 rounded p-2">{message}</p>}

      <div className="space-y-2">
        <Label>ステータス変更</Label>
        <div className="flex gap-2">
          <Select
            defaultValue={currentStatus}
            onValueChange={(v) => run(() => updateStatus(orderId, v))}
            disabled={isPending}
          >
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {orderStatuses.map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>支払いステータス</Label>
        <Select
          defaultValue={currentPayment}
          onValueChange={(v) => run(() => updatePayment(orderId, v))}
          disabled={isPending}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAYMENT_STATUSES.map(([val, label]) => (
              <SelectItem key={val} value={val}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {enablePhysicalShipping && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            run(() => updateTracking(orderId, fd))
          }}
          className="space-y-2"
        >
          <Label htmlFor="tracking_number">追跡番号登録（発送済みに変更されます）</Label>
          <div className="flex gap-2">
            <Input id="tracking_number" name="tracking_number" />
            <Button type="submit" size="default" variant="outline" disabled={isPending}>登録</Button>
          </div>
        </form>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          const fd = new FormData(e.currentTarget)
          run(() => addAdminNote(orderId, fd))
          ;(e.target as HTMLFormElement).reset()
        }}
        className="space-y-2"
      >
        <Label htmlFor="note">管理者メモを追加</Label>
        <Textarea id="note" name="note" rows={2} />
        <Button type="submit" size="sm" variant="outline" disabled={isPending}>追加</Button>
      </form>
    </div>
  )
}
