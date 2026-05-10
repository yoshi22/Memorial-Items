import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminSession } from '@/lib/auth'

const PRIVATE_BUCKETS = ['customer-uploads', 'proofs', 'print-masters']

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bucket: string; path: string[] }> },
) {
  const { bucket, path } = await params
  const filePath = path.join('/')

  if (!PRIVATE_BUCKETS.includes(bucket)) {
    return new NextResponse('Not found', { status: 404 })
  }

  const adminSession = await getAdminSession()

  if (!adminSession) {
    // Check if request carries a valid order token for customer-uploads / proofs
    const orderToken = request.nextUrl.searchParams.get('token')
    if (!orderToken) return new NextResponse('Forbidden', { status: 403 })

    const admin = createAdminClient()
    const orderId = filePath.split('/')[0]

    const { data: order } = await admin
      .from('orders')
      .select('id, public_order_token, public_proof_token')
      .eq('id', orderId)
      .single()

    if (
      !order ||
      (order.public_order_token !== orderToken && order.public_proof_token !== orderToken)
    ) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  const admin = createAdminClient()
  const { data, error } = await admin.storage.from(bucket).createSignedUrl(filePath, 60)
  if (error || !data) return new NextResponse('Not found', { status: 404 })

  return NextResponse.redirect(data.signedUrl)
}
