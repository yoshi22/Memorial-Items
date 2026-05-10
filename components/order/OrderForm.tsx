'use client'

import { useRef, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PhotoUploader } from '@/components/order/PhotoUploader'
import { BankTransferNotice } from '@/components/order/BankTransferNotice'
import { orderSchema, type OrderFormValues } from '@/lib/schemas/order'
import { FRAMES, SIZES, STYLES } from '@/lib/variants'
import type { BankTransferAccount, PaymentOption } from '@/lib/payments'
import { submitOrder } from '@/app/order/actions'

interface OrderFormProps {
  enabledMethods: PaymentOption[]
  bankAccount: BankTransferAccount | null
}

export function OrderForm({ enabledMethods, bankAccount }: OrderFormProps) {
  const [photos, setPhotos] = useState<File[]>([])
  const [photoError, setPhotoError] = useState('')
  const [serverError, setServerError] = useState('')
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const soleMethodId = enabledMethods.length === 1 ? enabledMethods[0]!.id : null

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: soleMethodId ? { payment_method: soleMethodId } : undefined,
  })

  function onSubmit(data: OrderFormValues) {
    if (photos.length < 3) {
      setPhotoError('写真を3枚以上追加してください')
      return
    }
    setPhotoError('')
    setServerError('')

    const formData = new FormData()
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined) formData.append(k, v)
    })
    photos.forEach((f) => formData.append('photos', f))

    startTransition(async () => {
      try {
        const result = await submitOrder(formData)
        if (result?.error) setServerError(result.error)
      } catch {
        setServerError('送信に失敗しました。写真の合計サイズが大きすぎる可能性があります。各15MB・合計75MB以内でご確認ください。')
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      {/* お客様情報 */}
      <div className="rounded-2xl border border-line bg-surface p-6 space-y-4">
        <h2 className="font-serif text-lg text-ink">お客様情報</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="customer_name">お名前 *</Label>
            <Input id="customer_name" {...register('customer_name')} />
            {errors.customer_name && <p className="text-xs text-red-600">{errors.customer_name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customer_email">メールアドレス *</Label>
            <Input id="customer_email" type="email" {...register('customer_email')} />
            {errors.customer_email && <p className="text-xs text-red-600">{errors.customer_email.message}</p>}
          </div>
        </div>
      </div>

      {/* 作品の仕様 */}
      <div className="rounded-2xl border border-line bg-surface p-6 space-y-4">
        <h2 className="font-serif text-lg text-ink">作品の仕様</h2>

        <div className="space-y-1.5">
          <Label htmlFor="pet_name">ペットのお名前 *</Label>
          <Input id="pet_name" {...register('pet_name')} />
          {errors.pet_name && <p className="text-xs text-red-600">{errors.pet_name.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>スタイル *</Label>
            <Select onValueChange={(v) => setValue('style', v as OrderFormValues['style'])}>
              <SelectTrigger><SelectValue placeholder="選択してください" /></SelectTrigger>
              <SelectContent>
                {STYLES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.style && <p className="text-xs text-red-600">{errors.style.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>サイズ *</Label>
            <Select onValueChange={(v) => setValue('size', v as OrderFormValues['size'])}>
              <SelectTrigger><SelectValue placeholder="選択してください" /></SelectTrigger>
              <SelectContent>
                {SIZES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.size && <p className="text-xs text-red-600">{errors.size.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>フレーム *</Label>
            <Select onValueChange={(v) => setValue('frame', v as OrderFormValues['frame'])}>
              <SelectTrigger><SelectValue placeholder="選択してください" /></SelectTrigger>
              <SelectContent>
                {FRAMES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.frame && <p className="text-xs text-red-600">{errors.frame.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>お支払い方法 *</Label>
          {soleMethodId ? (
            <>
              <input type="hidden" {...register('payment_method')} value={soleMethodId} />
              <p className="text-sm text-ink">お支払い方法: {enabledMethods[0]!.label}</p>
              {soleMethodId === 'bank_transfer' && bankAccount && (
                <div className="mt-2">
                  <BankTransferNotice account={bankAccount} variant="success" />
                </div>
              )}
            </>
          ) : (
            <>
              <Select onValueChange={(v) => setValue('payment_method', v as OrderFormValues['payment_method'])}>
                <SelectTrigger><SelectValue placeholder="選択してください" /></SelectTrigger>
                <SelectContent>
                  {enabledMethods.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-ink-mute">ご注文後に選択された方法に応じたお支払い案内を表示します。</p>
            </>
          )}
          {errors.payment_method && <p className="text-xs text-red-600">{errors.payment_method.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="must_keep_features">必ず残してほしい特徴 *</Label>
          <Textarea
            id="must_keep_features"
            {...register('must_keep_features')}
            rows={3}
          />
          <p className="text-xs text-ink-mute">毛色、模様、耳や目の特徴など、制作で必ず反映したい点を具体的にご記入ください。</p>
          {errors.must_keep_features && <p className="text-xs text-red-600">{errors.must_keep_features.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">その他ご要望（任意）</Label>
          <Textarea id="notes" {...register('notes')} rows={2} />
        </div>
      </div>

      {/* ペットのお写真 */}
      <div className="rounded-2xl border border-line bg-surface p-6 space-y-4">
        <h2 className="font-serif text-lg text-ink">ペットのお写真</h2>
        <div className="space-y-1.5">
          <Label>ペットの写真 *（3〜5枚）</Label>
          <PhotoUploader name="photos" onChange={setPhotos} error={photoError} />
        </div>
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <Button type="submit" size="lg" disabled={isPending} className="w-full">
        {isPending ? '送信中...' : '注文を送信する'}
      </Button>
    </form>
  )
}
