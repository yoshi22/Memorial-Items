'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ContentMessage, EditFormActions, ItemActions } from '@/components/admin/content/ContentManagerControls'
import { upsertFaq, deleteFaq, toggleFaqPublished } from './actions'
import type { FaqItem } from '@/lib/supabase/types'

export function FaqManager({ initialItems }: { initialItems: FaqItem[] }) {
  const [items, setItems] = useState(initialItems)
  const [editing, setEditing] = useState<string | 'new' | null>(null)
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleUpsert(e: React.FormEvent<HTMLFormElement>, id: string | null) {
    e.preventDefault()
    setMessage('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const r = await upsertFaq(id, fd)
      if (r.error) setMessage(`エラー: ${r.error}`)
      else {
        setMessage('保存しました')
        setEditing(null)
        // refresh items optimistically
        const res = await fetch('/admin/content/faq?refresh=1')
        void res
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('削除しますか？')) return
    startTransition(async () => {
      await deleteFaq(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
    })
  }

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => {
      await toggleFaqPublished(id, !current)
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, is_published: !current } : i))
    })
  }

  return (
    <div className="space-y-4">
      <ContentMessage message={message} />

      <Button onClick={() => setEditing('new')} disabled={isPending || editing === 'new'}>
        + 新規追加
      </Button>

      {editing === 'new' && (
        <form onSubmit={(e) => handleUpsert(e, null)} className="rounded-lg border border-gray-200 bg-white p-5 space-y-3">
          <h3 className="font-medium">新規FAQ</h3>
          <FaqFields />
          <EditFormActions isPending={isPending} onCancel={() => setEditing(null)} />
        </form>
      )}

      {items.map((item) => (
        <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-5">
          {editing === item.id ? (
            <form onSubmit={(e) => handleUpsert(e, item.id)} className="space-y-3">
              <FaqFields item={item} />
              <EditFormActions isPending={isPending} onCancel={() => setEditing(null)} />
            </form>
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">Q. {item.question}</p>
                  <p className="text-sm text-gray-600 mt-1">A. {item.answer}</p>
                  <p className="text-xs text-gray-400 mt-1">sort: {item.sort_order}</p>
                </div>
                <div className="ml-4 shrink-0">
                  <ItemActions
                    isPublished={item.is_published}
                    isPending={isPending}
                    onToggle={() => handleToggle(item.id, item.is_published)}
                    onEdit={() => setEditing(item.id)}
                    onDelete={() => handleDelete(item.id)}
                  />
                </div>
              </div>
              {!item.is_published && <span className="text-xs text-gray-400">（非公開）</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function FaqFields({ item }: { item?: FaqItem }) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="question">質問</Label>
        <Input id="question" name="question" defaultValue={item?.question} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="answer">回答</Label>
        <Textarea id="answer" name="answer" defaultValue={item?.answer} rows={3} required />
      </div>
      <div className="flex gap-4">
        <div className="space-y-1.5 flex-1">
          <Label htmlFor="sort_order">並び順</Label>
          <Input id="sort_order" name="sort_order" type="number" defaultValue={item?.sort_order ?? 0} />
        </div>
        <input type="hidden" name="is_published" value={item?.is_published !== false ? 'true' : 'false'} />
      </div>
    </>
  )
}
