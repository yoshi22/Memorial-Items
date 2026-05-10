import { Badge } from '@/components/ui/badge'
import type { BadgeProps } from '@/components/ui/badge'
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/variants'
import type { OrderStatus, PaymentStatus } from '@/lib/supabase/types'

const STATUS_VARIANT: Record<OrderStatus, BadgeProps['variant']> = {
  new: 'warning',
  in_review: 'warning',
  proof_uploaded: 'secondary',
  revision_requested: 'warning',
  approved: 'success',
  in_production: 'secondary',
  shipped: 'success',
  completed: 'default',
  cancelled: 'destructive',
}

const PAYMENT_VARIANT: Record<PaymentStatus, BadgeProps['variant']> = {
  unpaid: 'destructive',
  pending: 'warning',
  paid: 'success',
  refunded: 'secondary',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status] ?? 'secondary'}>
      {ORDER_STATUS_LABELS[status] ?? status}
    </Badge>
  )
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge variant={PAYMENT_VARIANT[status] ?? 'secondary'}>
      {PAYMENT_STATUS_LABELS[status] ?? status}
    </Badge>
  )
}
