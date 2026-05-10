'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function upsertFaq(id: string | null, formData: FormData): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    const question = String(formData.get('question') ?? '').trim()
    const answer = String(formData.get('answer') ?? '').trim()
    const sortOrder = Number(formData.get('sort_order') ?? 0)
    const isPublished = formData.get('is_published') === 'true'

    if (!question || !answer) return { error: '質問と回答を入力してください' }

    const admin = createAdminClient()
    if (id) {
      const { error } = await admin
        .from('faq_items')
        .update({ question, answer, sort_order: sortOrder, is_published: isPublished })
        .eq('id', id)
      if (error) return { error: error.message }
    } else {
      const { error } = await admin
        .from('faq_items')
        .insert({ question, answer, sort_order: sortOrder, is_published: isPublished })
      if (error) return { error: error.message }
    }

    revalidatePath('/admin/content/faq')
    return {}
  } catch {
    return { error: '保存に失敗しました' }
  }
}

export async function deleteFaq(id: string): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    const admin = createAdminClient()
    const { error } = await admin.from('faq_items').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/admin/content/faq')
    return {}
  } catch {
    return { error: '削除に失敗しました' }
  }
}

export async function toggleFaqPublished(id: string, next: boolean): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    const admin = createAdminClient()
    const { error } = await admin.from('faq_items').update({ is_published: next }).eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/admin/content/faq')
    return {}
  } catch {
    return { error: '更新に失敗しました' }
  }
}
