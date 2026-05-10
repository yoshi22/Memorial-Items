import { env } from '@/lib/env'

type EventName =
  | 'lp_viewed'
  | 'examples_viewed'
  | 'order_started'
  | 'photo_uploaded'
  | 'order_submitted'
  | 'proof_viewed'
  | 'revision_requested'
  | 'proof_approved'
  | 'payment_marked_paid'
  | 'order_shipped'

interface EventProps {
  order_id?: string
  style?: string
  size?: string
  frame?: string
  acquisition_source?: string
}

export async function trackServer(event: EventName, props: EventProps = {}) {
  if (!env.posthogKey) {
    console.log('[analytics:no-op]', event, props)
    return
  }
  const { PostHog } = await import('posthog-node')
  const client = new PostHog(env.posthogKey, { flushAt: 1, flushInterval: 0 })
  client.capture({ distinctId: props.order_id ?? 'server', event, properties: props })
  await client.shutdown()
}
