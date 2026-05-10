'use server'

import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { getExtension, uploadToBucket, validateExampleImage } from '@/lib/storage'

export async function upsertExample(id: string | null, formData: FormData): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    const title = String(formData.get('title') ?? '').trim()
    const shortDescription = String(formData.get('short_description') ?? '').trim() || null
    const sortOrder = Number(formData.get('sort_order') ?? 0)
    const isPublished = formData.get('is_published') === 'true'
    const tagsRaw = String(formData.get('tags') ?? '')
    const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)

    if (!title) return { error: 'タイトルを入力してください' }

    const admin = createAdminClient()
    let imageUrl: string | undefined

    const imageFile = formData.get('image_file')
    if (imageFile instanceof File && imageFile.size > 0) {
      const validationError = validateExampleImage(imageFile)
      if (validationError) return { error: validationError }
      const ext = getExtension(imageFile)
      const path = `${randomUUID()}.${ext}`
      await uploadToBucket('examples', path, imageFile)
      const { data } = admin.storage.from('examples').getPublicUrl(path)
      imageUrl = data.publicUrl
    }

    if (id) {
      const update: Record<string, unknown> = { title, short_description: shortDescription, sort_order: sortOrder, is_published: isPublished, tags }
      if (imageUrl) update['image_url'] = imageUrl
      const { error } = await admin.from('content_examples').update(update).eq('id', id)
      if (error) return { error: error.message }
    } else {
      if (!imageUrl) return { error: '画像を選択してください' }
      const { error } = await admin.from('content_examples').insert({
        title,
        short_description: shortDescription,
        image_url: imageUrl,
        tags,
        sort_order: sortOrder,
        is_published: isPublished,
      })
      if (error) return { error: error.message }
    }

    revalidatePath('/admin/content/examples')
    revalidatePath('/')
    return {}
  } catch {
    return { error: '保存に失敗しました' }
  }
}

export async function deleteExample(id: string): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    const admin = createAdminClient()
    const { error } = await admin.from('content_examples').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/admin/content/examples')
    revalidatePath('/')
    return {}
  } catch {
    return { error: '削除に失敗しました' }
  }
}

export async function toggleExamplePublished(id: string, next: boolean): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    const admin = createAdminClient()
    const { error } = await admin.from('content_examples').update({ is_published: next }).eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/admin/content/examples')
    revalidatePath('/')
    return {}
  } catch {
    return { error: '更新に失敗しました' }
  }
}
