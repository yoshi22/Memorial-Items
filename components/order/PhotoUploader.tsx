'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { validateImage } from '@/lib/storage'

const MAX_TOTAL_MB = 75
const MAX_TOTAL_BYTES = MAX_TOTAL_MB * 1024 * 1024

interface Props {
  name: string
  onChange: (files: File[]) => void
  error?: string
}

export function PhotoUploader({ name, onChange, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    const errors: string[] = []
    const valid: File[] = []

    for (const f of selected) {
      const err = validateImage(f)
      if (err) {
        errors.push(`${f.name}: ${err}`)
      } else {
        valid.push(f)
      }
    }

    const merged = [...files, ...valid].slice(0, 5)

    const totalBytes = merged.reduce((sum, f) => sum + f.size, 0)
    if (totalBytes > MAX_TOTAL_BYTES) {
      errors.push(`写真の合計サイズが上限（${MAX_TOTAL_MB}MB）を超えています。枚数を減らすか、サイズの小さい写真に変更してください。`)
      const kept = [...files]
      setValidationErrors(errors)
      onChange(kept)
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    setFiles(merged)
    setValidationErrors(errors)
    onChange(merged)
    if (inputRef.current) inputRef.current.value = ''
  }

  function remove(index: number) {
    const next = files.filter((_, i) => i !== index)
    setFiles(next)
    onChange(next)
  }

  const totalMB = (files.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(1)
  const isOverTotal = files.reduce((sum, f) => sum + f.size, 0) > MAX_TOTAL_BYTES

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        multiple
        className="hidden"
        onChange={handleChange}
        name={name}
      />
      <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} className="mb-3">
        写真を追加（最大5枚）
      </Button>

      {validationErrors.length > 0 && (
        <div className="mb-2 text-sm text-red-600 space-y-0.5">
          {validationErrors.map((e, i) => <p key={i}>{e}</p>)}
        </div>
      )}

      {files.length > 0 && (
        <>
          <ul className="space-y-1">
            {files.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm bg-gray-50 rounded px-3 py-1.5">
                <span className="flex-1 truncate">{f.name}</span>
                <span className="text-gray-400 shrink-0">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                <button type="button" onClick={() => remove(i)} className="text-gray-400 hover:text-red-500">
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <p className={`mt-1 text-xs ${isOverTotal ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
            合計 {totalMB} MB / 最大 {MAX_TOTAL_MB} MB
          </p>
        </>
      )}

      {(error || (files.length < 3 && files.length > 0)) && (
        <p className="mt-1 text-xs text-red-600">{error ?? '写真は3枚以上必要です'}</p>
      )}
      <p className="mt-1 text-xs text-gray-500">JPEG/PNG/WebP/HEIC、各15MB以内・合計75MBまで。3〜5枚。顔がはっきり写っているものをご用意ください。</p>
    </div>
  )
}
