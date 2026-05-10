'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { uploadPrintMaster } from '@/app/admin/orders/[id]/actions'
import { validateProofImage } from '@/lib/storage'

export function PrintMasterUploader({ orderId, isApproved }: { orderId: string; isApproved: boolean }) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isPending, startTransition] = useTransition()

  if (!isApproved) {
    return <p className="text-sm text-gray-500">顧客承認後にアップロードできます</p>
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateProofImage(file)
    if (err) {
      setError(err)
      e.target.value = ''
    } else {
      setError('')
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        const result = await uploadPrintMaster(orderId, formData)
        if (result.error) {
          setError(result.error)
        } else {
          setSuccess('print master をアップロードしました')
          setOpen(false)
        }
      } catch {
        setError('アップロードに失敗しました。ファイルサイズが50MBを超えていないかご確認ください。')
      }
    })
  }

  return (
    <div>
      {success && <p className="text-sm text-green-700 mb-2">{success}</p>}
      {!open ? (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>Print Master をアップロード</Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 border border-gray-200 rounded-lg p-4">
          <div className="space-y-1.5">
            <p className="text-xs text-gray-500">JPEG/PNG/WebP、50MB以内</p>
            <input
              name="master_file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              className="text-sm"
              onChange={handleFileChange}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isPending}>{isPending ? '送信中...' : 'アップロード'}</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>キャンセル</Button>
          </div>
        </form>
      )}
    </div>
  )
}
