'use server'

import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { getExtension, uploadToBucket, validateProofImage } from '@/lib/storage'
import { sendPaymentConfirmed, sendProofReady, sendShipped } from '@/lib/email'
import { trackServer } from '@/lib/analytics'

type AdminClient = ReturnType<typeof createAdminClient>
type AdminUser = Awaited<ReturnType<typeof requireAdmin>>

function adminEmail(user: AdminUser): string {
  return user.email ?? 'admin'
}

async function insertAdminNote(admin: AdminClient, orderId: string, note: string, user: AdminUser) {
  return admin.from('admin_notes').insert({
    order_id: orderId,
    note,
    created_by: adminEmail(user),
  })
}

function revalidateOrder(orderId: string) {
  revalidatePath(`/admin/orders/${orderId}`)
}

async function runNotification(label: string, task: () => Promise<void>) {
  try {
    await task()
  } catch (e) {
    console.error(`${label} error:`, e)
  }
}

export async function updateStatus(orderId: string, status: string): Promise<{ error?: string }> {
  try {
    const user = await requireAdmin()
    const admin = createAdminClient()
    const { error } = await admin.from('orders').update({ status }).eq('id', orderId)
    if (error) return { error: error.message }
    await insertAdminNote(admin, orderId, `ステータスを「${status}」に変更`, user)
    revalidateOrder(orderId)
    return {}
  } catch {
    return { error: '更新に失敗しました' }
  }
}

export async function updatePayment(orderId: string, paymentStatus: string): Promise<{ error?: string }> {
  try {
    const user = await requireAdmin()
    const admin = createAdminClient()
    const { data: order } = await admin
      .from('orders')
      .select('customer_email, customer_name, pet_name, public_order_token')
      .eq('id', orderId)
      .single()
    const { error } = await admin.from('orders').update({ payment_status: paymentStatus }).eq('id', orderId)
    if (error) return { error: error.message }
    await insertAdminNote(admin, orderId, `支払いステータスを「${paymentStatus}」に変更`, user)
    if (paymentStatus === 'paid' && order) {
      await trackServer('payment_marked_paid', { order_id: orderId })
      await runNotification('sendPaymentConfirmed', async () => {
        await sendPaymentConfirmed({
          to: order.customer_email,
          customerName: order.customer_name,
          petName: order.pet_name,
          orderToken: order.public_order_token,
        })
      })
    }
    revalidateOrder(orderId)
    return {}
  } catch {
    return { error: '更新に失敗しました' }
  }
}

export async function updateTracking(orderId: string, formData: FormData): Promise<{ error?: string }> {
  try {
    const user = await requireAdmin()
    const trackingNumber = String(formData.get('tracking_number') ?? '').trim()
    if (!trackingNumber) return { error: '追跡番号を入力してください' }

    const admin = createAdminClient()
    const { data: order, error: fetchError } = await admin
      .from('orders')
      .select('customer_email, customer_name, pet_name, public_order_token')
      .eq('id', orderId)
      .single()
    if (fetchError || !order) return { error: '注文が見つかりません' }

    const { error } = await admin
      .from('orders')
      .update({ status: 'shipped', tracking_number: trackingNumber })
      .eq('id', orderId)
    if (error) return { error: error.message }

    await insertAdminNote(admin, orderId, `追跡番号登録: ${trackingNumber}`, user)

    await runNotification('sendShipped', async () => {
      await sendShipped({
        to: order.customer_email,
        customerName: order.customer_name,
        petName: order.pet_name,
        trackingNumber,
        orderToken: order.public_order_token,
      })
      await trackServer('order_shipped', { order_id: orderId })
    })

    revalidateOrder(orderId)
    return {}
  } catch {
    return { error: '更新に失敗しました' }
  }
}

export async function addAdminNote(orderId: string, formData: FormData): Promise<{ error?: string }> {
  try {
    const user = await requireAdmin()
    const note = String(formData.get('note') ?? '').trim()
    if (!note) return { error: 'メモを入力してください' }

    const admin = createAdminClient()
    const { error } = await insertAdminNote(admin, orderId, note, user)
    if (error) return { error: error.message }
    revalidateOrder(orderId)
    return {}
  } catch {
    return { error: '追加に失敗しました' }
  }
}

export async function uploadProof(orderId: string, formData: FormData): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    const file = formData.get('proof_file')
    if (!(file instanceof File) || file.size === 0) return { error: 'ファイルを選択してください' }
    const validationError = validateProofImage(file)
    if (validationError) return { error: validationError }

    const productionNotes = String(formData.get('production_notes') ?? '').trim() || null
    const admin = createAdminClient()

    const { data: existing } = await admin
      .from('proofs')
      .select('version')
      .eq('order_id', orderId)
      .order('version', { ascending: false })
      .limit(1)
      .single()

    const nextVersion = (existing?.version ?? 0) + 1
    const ext = getExtension(file)
    const path = `${orderId}/v${nextVersion}_${randomUUID()}.${ext}`

    await uploadToBucket('proofs', path, file)

    const { error: insertError } = await admin.from('proofs').insert({
      order_id: orderId,
      proof_image_url: path,
      version: nextVersion,
      production_notes: productionNotes,
    })
    if (insertError) return { error: insertError.message }

    await admin.from('orders').update({ status: 'proof_uploaded' }).eq('id', orderId)

    const { data: order } = await admin
      .from('orders')
      .select('customer_email, customer_name, pet_name, public_proof_token')
      .eq('id', orderId)
      .single()

    if (order) {
      await runNotification('sendProofReady', async () => {
        await sendProofReady({
          to: order.customer_email,
          customerName: order.customer_name,
          petName: order.pet_name,
          proofToken: order.public_proof_token,
          version: nextVersion,
        })
      })
    }

    revalidateOrder(orderId)
    return {}
  } catch (e) {
    console.error('uploadProof error:', e)
    return { error: 'アップロードに失敗しました' }
  }
}

export async function uploadPrintMaster(orderId: string, formData: FormData): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    const file = formData.get('master_file')
    if (!(file instanceof File) || file.size === 0) return { error: 'ファイルを選択してください' }
    const validationError = validateProofImage(file)
    if (validationError) return { error: validationError }

    const ext = getExtension(file)
    const path = `${orderId}/master_${randomUUID()}.${ext}`
    await uploadToBucket('print-masters', path, file)

    const admin = createAdminClient()
    const { error } = await admin.from('art_assets').insert({
      order_id: orderId,
      asset_type: 'print_master',
      file_url: path,
    })

    if (error) return { error: error.message }

    revalidateOrder(orderId)
    return {}
  } catch (e) {
    console.error('uploadPrintMaster error:', e)
    return { error: 'アップロードに失敗しました' }
  }
}
