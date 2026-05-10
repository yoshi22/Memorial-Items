import { z } from 'zod'

export const orderSchema = z.object({
  customer_name: z.string().min(1, '名前を入力してください'),
  customer_email: z.string().email('正しいメールアドレスを入力してください'),
  pet_name: z.string().min(1, 'ペットの名前を入力してください'),
  style: z.enum(['clean_illustration', 'soft_watercolor', 'modern_portrait'], {
    error: 'スタイルを選択してください',
  }),
  size: z.enum(['S', 'M', 'L'], {
    error: 'サイズを選択してください',
  }),
  frame: z.enum(['natural_wood', 'black', 'white'], {
    error: 'フレームを選択してください',
  }),
  payment_method: z.enum(['bank_transfer', 'credit_card', 'paypay_qr'], {
    error: '支払い方法を選択してください',
  }),
  must_keep_features: z.string().min(1, '必ず残してほしい特徴を入力してください'),
  notes: z.string().optional(),
})

export type OrderFormValues = z.infer<typeof orderSchema>
