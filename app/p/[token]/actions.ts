'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revisionRequestSchema } from '@/lib/schemas/proof'
import { sendAdminProofApproved, sendAdminRevisionRequested, sendProofApproved, sendRevisionReceived } from '@/lib/email'
import { trackServer } from '@/lib/analytics'

export async function approveProof(proofToken: string): Promise<{ error?: string }> {
  try {
    const admin = createAdminClient()

    const { data: order } = await admin
      .from('orders')
      .select('id, status, customer_email, customer_name, pet_name, public_order_token')
      .eq('public_proof_token', proofToken)
      .single()

    if (!order) return { error: '注文が見つかりません' }
    if (order.status === 'approved') return { error: 'すでに承認済みです' }
    if (order.status !== 'proof_uploaded' && order.status !== 'revision_requested') {
      return { error: 'この操作は現在の状態では実行できません' }
    }

    const { error: updateError } = await admin
      .from('orders')
      .update({ status: 'approved' })
      .eq('id', order.id)
    if (updateError) return { error: '承認の保存に失敗しました' }

    await trackServer('proof_approved', { order_id: order.id })

    try {
      await sendProofApproved({
        to: order.customer_email,
        customerName: order.customer_name,
        petName: order.pet_name,
        orderToken: order.public_order_token,
      })
      await sendAdminProofApproved({
        customerName: order.customer_name,
        petName: order.pet_name,
        orderToken: order.public_order_token,
      })
    } catch (e) {
      console.error('Email error:', e)
    }

    return {}
  } catch {
    return { error: '処理に失敗しました。しばらくしてから再度お試しください。' }
  }
}

export async function requestRevision(
  proofToken: string,
  proofId: string,
  formData: FormData,
): Promise<{ error?: string }> {
  try {
    const admin = createAdminClient()

    const { data: order } = await admin
      .from('orders')
      .select('id, status, customer_email, customer_name, pet_name, public_order_token')
      .eq('public_proof_token', proofToken)
      .single()

    if (!order) return { error: '注文が見つかりません' }
    if (order.status === 'approved') return { error: 'すでに承認済みです' }
    if (order.status !== 'proof_uploaded' && order.status !== 'revision_requested') {
      return { error: 'この操作は現在の状態では実行できません' }
    }

    const parsed = revisionRequestSchema.safeParse({
      request_text: formData.get('request_text'),
    })
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? '入力を確認してください' }
    }

    const { error: insertError } = await admin.from('revision_requests').insert({
      order_id: order.id,
      proof_id: proofId,
      request_text: parsed.data.request_text,
      status: 'open',
    })
    if (insertError) return { error: '修正依頼の保存に失敗しました' }

    await admin.from('orders').update({ status: 'revision_requested' }).eq('id', order.id)

    await trackServer('revision_requested', { order_id: order.id })

    try {
      await sendRevisionReceived({
        to: order.customer_email,
        customerName: order.customer_name,
        petName: order.pet_name,
        orderToken: order.public_order_token,
      })
      await sendAdminRevisionRequested({
        customerName: order.customer_name,
        petName: order.pet_name,
        orderToken: order.public_order_token,
        proofToken,
        requestText: parsed.data.request_text,
      })
    } catch (e) {
      console.error('Email error:', e)
    }

    return {}
  } catch {
    return { error: '処理に失敗しました。しばらくしてから再度お試しください。' }
  }
}
