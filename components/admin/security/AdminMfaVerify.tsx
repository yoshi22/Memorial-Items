'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/browser'
import { getMfaAttemptState, recordMfaFailure, recordMfaSuccess } from '@/app/admin/security/actions'

export function AdminMfaVerify() {
  const router = useRouter()
  const [factorId, setFactorId] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    ;(async () => {
      try {
        const supabase = createClient()
        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
        if (aalData?.currentLevel === 'aal2') {
          router.replace('/admin/orders')
          return
        }

        const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()
        if (factorsError) {
          setError('MFA 情報の取得に失敗しました。')
          return
        }

        const currentFactor = factors.totp?.[0]
        if (!currentFactor) {
          router.replace('/admin/security/enroll-mfa')
          return
        }

        setFactorId(currentFactor.id)
      } catch (e) {
        console.error('AdminMfaVerify failed:', e)
        setError('MFA 情報の取得に失敗しました。再ログインしてください。')
      }
    })()
  }, [router])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const supabase = createClient()

    startTransition(async () => {
      const state = await getMfaAttemptState()
      if (state.locked) {
        setError('このアカウントは一時的にロックされています。時間をおいて再試行してください。')
        return
      }

      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId })
      if (challengeError || !challenge) {
        setError(challengeError?.message ?? 'MFA チャレンジの生成に失敗しました。')
        return
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      })

      if (verifyError) {
        const failure = await recordMfaFailure(verifyError.message)
        setError(failure.lockedUntil
          ? 'このアカウントは一時的にロックされました。時間をおいて再試行してください。'
          : '確認コードが正しくありません。もう一度お試しください。')
        return
      }

      await recordMfaSuccess('verified')
      router.replace('/admin/orders')
    })
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">管理者 MFA 確認</h1>
        <p className="text-sm text-gray-600">Authenticator アプリに表示された 6 桁コードを入力してください。</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="totp_code_verify">6桁コード</label>
          <Input id="totp_code_verify" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.trim())} required />
        </div>
        <Button type="submit" disabled={isPending || !factorId}>{isPending ? '確認中...' : 'MFA を確認する'}</Button>
      </form>
    </div>
  )
}
