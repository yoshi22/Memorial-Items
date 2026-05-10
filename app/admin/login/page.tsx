'use client'

import { useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sendMagicLink } from './actions'
import { Suspense } from 'react'

function LoginForm() {
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(
    errorParam === 'unauthorized' ? '管理者ログインに失敗しました。もう一度お試しください。' :
    errorParam === 'auth_failed' ? '認証に失敗しました' :
    errorParam === 'no_code' ? 'ログインリンクが無効です。もう一度お試しください。' :
    errorParam === 'locked' ? 'このアカウントは一時的にロックされています。時間をおいて再試行してください。' : '',
  )
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await sendMagicLink(formData)
      if (result.error) setError(result.error)
      else setSent(true)
    })
  }

  if (sent) {
    return (
      <div className="text-center">
        <p className="text-gray-700 font-medium">リクエストを受け付けました</p>
        <p className="text-sm text-gray-500 mt-2">許可済みの管理者にはログインリンクが送信されます。</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">メールアドレス</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-gray-500">管理画面は Basic 認証、許可済みメール、magic link、TOTP で保護されます。</p>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? '送信中...' : 'ログインリンクを送る'}
      </Button>
    </form>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8">
        <h1 className="text-xl font-semibold mb-6 text-center">管理者ログイン</h1>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
