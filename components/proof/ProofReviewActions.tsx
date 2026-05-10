'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { approveProof, requestRevision } from '@/app/p/[token]/actions'

interface Props {
  proofToken: string
  proofId: string
  isApproved: boolean
  enablePhysicalShipping: boolean
}

export function ProofReviewActions({ proofToken, proofId, isApproved, enablePhysicalShipping }: Props) {
  const [mode, setMode] = useState<'none' | 'revision'>('none')
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  if (isApproved) {
    return (
      <div className="rounded-xl border border-line bg-accent-soft p-4 text-center">
        <p className="font-medium text-accent-ink">✓ 承認済みです</p>
        <p className="text-sm text-accent-ink/80 mt-1">
          {enablePhysicalShipping
            ? '印刷・額装の手配を進めています。'
            : '完成画像はご注文詳細ページからダウンロードいただけます。'}
        </p>
      </div>
    )
  }

  if (message) {
    return (
      <div className="rounded-xl border border-line bg-accent-soft p-4 text-center">
        <p className="text-accent-ink">{message}</p>
      </div>
    )
  }

  function handleApprove() {
    setError('')
    startTransition(async () => {
      const result = await approveProof(proofToken)
      if (result.error) {
        setError(result.error)
      } else {
        setMessage(
          enablePhysicalShipping
            ? '承認しました。印刷・額装・発送へ進みます。ありがとうございます！'
            : '承認しました。完成画像をご注文詳細ページからダウンロードいただけます。ありがとうございます！',
        )
      }
    })
  }

  function handleRevisionSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await requestRevision(proofToken, proofId, formData)
      if (result.error) {
        setError(result.error)
      } else {
        setMessage('修正依頼を送信しました。対応後に改めてご連絡します。')
      }
    })
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      {mode === 'none' && (
        <>
          {/* Reassurance banner */}
          <div className="flex items-start gap-2.5 rounded-xl bg-accent-soft text-accent-ink px-4 py-3 text-sm">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flex-shrink-0 mt-0.5"
              aria-hidden="true"
            >
              <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/>
            </svg>
            <p>承認されるまで、印刷には進みません。修正は無料で2回まで承ります。</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="flex-1 sm:flex-[2] !bg-accent !text-white border-0 shadow-[0_8px_20px_rgba(184,153,104,0.25)] hover:brightness-[1.04]"
              onClick={handleApprove}
              disabled={isPending}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
                aria-hidden="true"
              >
                <path d="M5 12l5 5L20 7"/>
              </svg>
              この内容で承認する
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1"
              onClick={() => setMode('revision')}
              disabled={isPending}
            >
              修正依頼を送る
            </Button>
          </div>
        </>
      )}

      {mode === 'revision' && (
        <form onSubmit={handleRevisionSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="request_text">修正内容をご記入ください</Label>
            <Textarea
              id="request_text"
              name="request_text"
              rows={5}
              required
            />
            <p className="text-xs text-ink-mute">気になる箇所と希望する調整内容を、できるだけ具体的にご記入ください。</p>
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? '送信中...' : '修正依頼を送信する'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setMode('none')} disabled={isPending}>
              戻る
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
