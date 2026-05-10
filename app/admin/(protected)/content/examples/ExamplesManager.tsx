'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ContentMessage, EditFormActions, ItemActions } from '@/components/admin/content/ContentManagerControls'
import { upsertExample, deleteExample, toggleExamplePublished } from './actions'
import type { ContentExample } from '@/lib/supabase/types'
import { validateExampleImage } from '@/lib/storage'

export function ExamplesManager({ initialItems }: { initialItems: ContentExample[] }) {
  const [items, setItems] = useState(initialItems)
  const [editing, setEditing] = useState<string | 'new' | null>(null)
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleUpsert(e: React.FormEvent<HTMLFormElement>, id: string | null) {
    e.preventDefault()
    setMessage('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const r = await upsertExample(id, fd)
      if (r.error) setMessage(`エラー: ${r.error}`)
      else {
        setMessage('保存しました')
        setEditing(null)
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('削除しますか？')) return
    startTransition(async () => {
      await deleteExample(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
    })
  }

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => {
      await toggleExamplePublished(id, !current)
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
          <h3 className="font-medium">新規作例</h3>
          <ExampleFields />
          <EditFormActions isPending={isPending} onCancel={() => setEditing(null)} />
        </form>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            {editing === item.id ? (
              <form onSubmit={(e) => handleUpsert(e, item.id)} className="p-4 space-y-3">
                <ExampleFields item={item} />
                <EditFormActions isPending={isPending} onCancel={() => setEditing(null)} />
              </form>
            ) : (
              <>
                <div className="aspect-square relative bg-gray-100">
                  <Image src={item.image_url} alt={item.title} fill className="object-cover" sizes="300px" />
                </div>
                <div className="p-3">
                  <p className="font-medium text-sm">{item.title}</p>
                  {item.short_description && <p className="text-xs text-gray-500 mt-0.5">{item.short_description}</p>}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.tags.map((t) => (
                      <span key={t} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{t}</span>
                    ))}
                  </div>
                  <div className="mt-3">
                    <ItemActions
                      isPublished={item.is_published}
                      isPending={isPending}
                      onToggle={() => handleToggle(item.id, item.is_published)}
                      onEdit={() => setEditing(item.id)}
                      onDelete={() => handleDelete(item.id)}
                    />
                  </div>
                  {!item.is_published && <span className="text-xs text-gray-400">（非公開）</span>}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ExampleFields({ item }: { item?: ContentExample }) {
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateExampleImage(file)
    if (err) {
      alert(err)
      e.target.value = ''
    }
  }

  return (
    <>
      <div className="space-y-1.5">
        <Label>タイトル</Label>
        <Input name="title" defaultValue={item?.title} required />
      </div>
      <div className="space-y-1.5">
        <Label>説明（任意）</Label>
        <Textarea name="short_description" defaultValue={item?.short_description ?? ''} rows={2} />
      </div>
      <div className="space-y-1.5">
        <Label>画像{item ? '（変更する場合のみ）' : ' *'}</Label>
        <input name="image_file" type="file" accept="image/jpeg,image/png,image/webp" className="text-sm" onChange={handleFileChange} />
      </div>
      <div className="flex gap-4">
        <div className="space-y-1.5 flex-1">
          <Label>タグ（カンマ区切り）</Label>
          <Input name="tags" defaultValue={item?.tags.join(', ')} placeholder="dog, soft, framed" />
        </div>
        <div className="space-y-1.5 w-24">
          <Label>並び順</Label>
          <Input name="sort_order" type="number" defaultValue={item?.sort_order ?? 0} />
        </div>
      </div>
      <input type="hidden" name="is_published" value={item?.is_published !== false ? 'true' : 'false'} />
    </>
  )
}
