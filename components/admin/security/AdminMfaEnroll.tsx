'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/browser'
import { getMfaAttemptState, recordMfaEnrollStarted, recordMfaFailure, recordMfaSuccess } from '@/app/admin/security/actions'

export function AdminMfaEnroll() {
  const router = useRouter()
  const [factorId, setFactorId] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isReady, setIsReady] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const supabase = createClient()

    ;(async () => {
      try {
        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
        if (aalData?.currentLevel === 'aal2') {
          router.replace('/admin/orders')
          return
        }

        const { data: factors } = await supabase.auth.mfa.listFactors()
        if ((factors?.totp?.length ?? 0) > 0) {
          router.replace('/admin/security/verify-mfa')
          return
        }

        const unverifiedTotp = factors?.all?.filter((factor) => factor.factor_type === 'totp' && factor.status === 'unverified') ?? []
        for (const factor of unverifiedTotp) {
          await supabase.auth.mfa.unenroll({ factorId: factor.id })
        }

        const { data, error: enrollError } = await supabase.auth.mfa.enroll({
          factorType: 'totp',
          issuer: 'Memorial Items Admin',
          friendlyName: 'Memorial Items Admin',
        })
        if (enrollError || !data) {
          setError(enrollError?.message ?? 'MFA 登録の初期化に失敗しました。')
          return
        }

        setFactorId(data.id)
        const QRCode = (await import('qrcode')).default
        setQrCode(await QRCode.toDataURL(data.totp.uri, { width: 224, margin: 2 }))
        setSecret(data.totp.secret)
        setIsReady(true)
        await recordMfaEnrollStarted()
      } catch {
        setError('MFA 登録の初期化に失敗しました。')
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

      await recordMfaSuccess('enrolled')
      router.replace('/admin/orders')
    })
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">管理者 MFA 登録</h1>
        <p className="text-sm text-gray-600">Authenticator アプリで QR を読み取り、6桁コードを入力してください。</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {isReady ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <img src={qrCode} alt="TOTP QR code" className="h-56 w-56 rounded border border-gray-200 bg-white" />
          <div className="rounded border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
            うまく読み取れない場合は secret を手入力してください: <span className="font-mono">{secret}</span>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="totp_code">6桁コード</label>
            <Input id="totp_code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.trim())} required />
          </div>
          <Button type="submit" disabled={isPending}>{isPending ? '確認中...' : 'MFA を有効化する'}</Button>
        </form>
      ) : (
        <p className="text-sm text-gray-500">MFA 登録情報を準備しています...</p>
      )}
    </div>
  )
}
