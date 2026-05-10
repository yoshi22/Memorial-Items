'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

export function AdminSecurityCheck() {
  const router = useRouter()
  const [message, setMessage] = useState('認証状態を確認しています...')

  useEffect(() => {
    ;(async () => {
      try {
        const supabase = createClient()
        const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
        if (aalError) {
          setMessage('認証状態の確認に失敗しました。再度ログインしてください。')
          return
        }

        if (aalData.currentLevel === 'aal2') {
          router.replace('/admin/orders')
          return
        }

        const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()
        if (factorsError) {
          setMessage('MFA 設定の確認に失敗しました。再度ログインしてください。')
          return
        }

        if ((factors.totp?.length ?? 0) > 0) {
          router.replace('/admin/security/verify-mfa')
          return
        }

        router.replace('/admin/security/enroll-mfa')
      } catch (e) {
        console.error('AdminSecurityCheck failed:', e)
        const detail = e instanceof Error ? e.message : String(e)
        setMessage(`認証情報の取得に失敗しました: ${detail}`)
      }
    })()
  }, [router])

  return <p className="text-sm text-gray-600">{message}</p>
}
