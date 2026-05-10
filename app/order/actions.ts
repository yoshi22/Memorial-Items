'use server'

import { redirect } from 'next/navigation'
import { randomUUID } from 'crypto'
import { orderSchema } from '@/lib/schemas/order'
import { createAdminClient } from '@/lib/supabase/admin'
import { getExtension, uploadToBucket, validateImage } from '@/lib/storage'
import { sendAdminOrderCreated, sendOrderReceived } from '@/lib/email'
import { trackServer } from '@/lib/analytics'
import { getEnabledPaymentMethodIds } from '@/lib/payments'

export async function submitOrder(formData: FormData): Promise<{ error: string } | undefined> {
  const raw = {
    customer_name: formData.get('customer_name'),
    customer_email: formData.get('customer_email'),
    pet_name: formData.get('pet_name'),
    style: formData.get('style'),
    size: formData.get('size'),
    frame: formData.get('frame'),
    payment_method: formData.get('payment_method'),
    must_keep_features: formData.get('must_keep_features'),
    notes: formData.get('notes') || undefined,
  }

  const parsed = orderSchema.safeParse(raw)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { error: first?.message ?? '入力内容を確認してください' }
  }

  const enabledIds = getEnabledPaymentMethodIds()
  if (!enabledIds.includes(parsed.data.payment_method)) {
    return { error: '選択された支払い方法は現在ご利用いただけません' }
  }

  const photos = formData.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0)
  if (photos.length < 3 || photos.length > 5) {
    return { error: '写真は3〜5枚必要です' }
  }
  for (const photo of photos) {
    const validationError = validateImage(photo)
    if (validationError) return { error: validationError }
  }

  const admin = createAdminClient()

  const { data: order, error: insertError } = await admin
    .from('orders')
    .insert({
      customer_name: parsed.data.customer_name,
      customer_email: parsed.data.customer_email,
      pet_name: parsed.data.pet_name,
      style: parsed.data.style,
      size: parsed.data.size,
      frame: parsed.data.frame,
      payment_method: parsed.data.payment_method,
      must_keep_features: parsed.data.must_keep_features,
      notes: parsed.data.notes ?? null,
      status: 'new',
      payment_status: 'unpaid',
    })
    .select('id, public_order_token')
    .single()

  if (insertError || !order) {
    console.error('Order insert error:', insertError)
    return { error: '注文の送信に失敗しました。しばらくしてから再試行してください。' }
  }

  let successCount = 0
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i]!
    const ext = getExtension(photo)
    const path = `${order.id}/${randomUUID()}.${ext}`
    try {
      await uploadToBucket('customer-uploads', path, photo)
      await admin.from('order_images').insert({
        order_id: order.id,
        file_path: path,
        original_filename: photo.name,
        mime_type: photo.type,
        file_size: photo.size,
        sort_order: i,
      })
      successCount++
    } catch (e) {
      console.error('Photo upload error:', e)
    }
  }

  if (successCount < 3) {
    await admin.from('orders').delete().eq('id', order.id)
    return { error: `写真のアップロードに失敗しました（成功: ${successCount}/${photos.length}枚）。写真のサイズや形式をご確認の上、再度お試しください。` }
  }

  await trackServer('order_submitted', {
    order_id: order.id,
    style: parsed.data.style,
    size: parsed.data.size,
    frame: parsed.data.frame,
  })

  try {
    await sendOrderReceived({
      to: parsed.data.customer_email,
      customerName: parsed.data.customer_name,
      petName: parsed.data.pet_name,
      orderToken: order.public_order_token,
      paymentMethod: parsed.data.payment_method,
    })
    await sendAdminOrderCreated({
      customerName: parsed.data.customer_name,
      customerEmail: parsed.data.customer_email,
      petName: parsed.data.pet_name,
      orderToken: order.public_order_token,
      paymentMethod: parsed.data.payment_method,
    })
  } catch (e) {
    console.error('Email send error:', e)
  }

  redirect(`/order/submitted/${order.public_order_token}`)
}
