'use client'

import { Button } from '@/components/ui/button'

interface ContentMessageProps {
  message: string
}

interface EditFormActionsProps {
  isPending: boolean
  onCancel: () => void
}

interface ItemActionsProps {
  isPublished: boolean
  isPending: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}

export function ContentMessage({ message }: ContentMessageProps) {
  if (!message) return null
  return <p className="text-sm text-gray-700 bg-gray-50 rounded p-2">{message}</p>
}

export function EditFormActions({ isPending, onCancel }: EditFormActionsProps) {
  return (
    <div className="flex gap-2">
      <Button type="submit" size="sm" disabled={isPending}>保存</Button>
      <Button type="button" size="sm" variant="outline" onClick={onCancel}>キャンセル</Button>
    </div>
  )
}

export function ItemActions({ isPublished, isPending, onToggle, onEdit, onDelete }: ItemActionsProps) {
  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={onToggle} disabled={isPending}>
        {isPublished ? '非公開' : '公開'}
      </Button>
      <Button size="sm" variant="outline" onClick={onEdit} disabled={isPending}>編集</Button>
      <Button size="sm" variant="destructive" onClick={onDelete} disabled={isPending}>削除</Button>
    </div>
  )
}
