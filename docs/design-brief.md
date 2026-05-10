# Design Brief — Memorial Items

## このファイルの使い方

Claude Design に渡して UI の改善を依頼するためのブリーフです。  
現在のすべてのコードと設計意図を含んでいます。コードを編集する場合は元ファイルを直接書き換えてください。

---

## 1. プロダクト概要

**Memorial Items** は、ペット（犬・猫）の写真をオーダーメイドの額装アートに仕上げるサービスです。  
職人が手作業でアート制作し、顧客が初稿を確認・修正依頼・承認した後に印刷・額装してお届けします。

### ターゲット顧客
- 犬・猫の飼い主
- 「写真はあるが、形として残す手段に満足していない」
- 「ちゃんとして見えること」を重視（価格より品質・信頼感）
- 誕生日・記念日・日常の思い出を残したい

### 勝ち筋（顧客が感じてほしいこと）
1. **うちの子らしさがある**（高い再現性）
2. **初稿確認と修正が明快**（プロセスの透明性）
3. **届いてすぐ飾れる**（即座に使える完成品）
4. **信頼できる制作者に頼んでいる感覚**（手作業・丁寧さ）

---

## 2. 現在のデザイン課題

### 2-1. 全体的な問題
- **ブランド個性が薄い**: 全ページが gray/white のモノクロ配色で、温かみや感情的なつながりが感じられない
- **フォントが無個性**: システムフォントのまま。手作業・職人感・温もりが伝わらない
- **ヒーローに画像がない**: LP のヒーローセクションは文字のみ。作品の美しさが伝わらない
- **CTAが弱い**: 「注文する」ボタンが gray-900 の地味な色で、感情的な引力がない
- **ステップが没入感なし**: 注文フローのステップ説明が箇条書きに近く、体験の素晴らしさを想像させない

### 2-2. ページ別の問題

**LP (`/`)**  
- Hero セクションに作品サンプル画像がない（テキストのみ）
- 作例セクションが画像があっても地味なカードデザイン
- 信頼構築要素（制作者の姿勢、品質へのこだわり）が弱い
- Proof確認プロセスの安心感訴求が不足

**注文フォーム (`/order`)**  
- スタイル・サイズ・フレームの Select が素っ気ない
- どんな完成品になるかイメージできる視覚的なヒントがない
- フォーム全体が無機質で、ペットへの愛情に寄り添う雰囲気がない

**顧客注文詳細 (`/o/[token]`)**  
- ステータス表示が地味（Badge のみ）
- 「今どの段階にいるか」のプログレスが視覚化されていない

**Proof確認 (`/p/[token]`)**  
- 「承認する」ボタンが他のボタンと視覚的な区別がない（最重要アクションなのに）
- 承認後のメッセージが地味

---

## 3. 改善の方向性

### ブランド・ビジュアルコンセプト
**「大切な家族の記憶を、部屋に飾れる芸術に変える」**

- 温かみがあるが上質（cheap に見えない）
- 感情的・記念的なものを扱う誠実さ
- 日本のインテリアに馴染む落ち着いた美しさ

### 色・フォント方針（提案）
- **アクセントカラー**: warm な土色系（stone, amber, warm-brown）や深い緑（sage green）のいずれか。gray 一辺倒からの脱却
- **フォント**: 見出しに日本語対応のセリフ or ライン感ある Google Fonts（例: Cormorant Garamond, Noto Serif JP, または Playfair Display + Noto Sans JP の組み合わせ）。本文はサンセリフを維持
- **背景**: 真っ白ではなく、off-white（stone-50, warm-gray-50）が温かみを与える

### 各セクションの改善ポイント
- **Nav**: ロゴに個性を（現在は単純な text）
- **Hero**: アート作品の画像（またはプレースホルダー）を入れ、コピーの感情訴求を強化
- **Step 説明**: 番号とテキストだけでなく、各ステップのアイコンや小さなイラスト
- **スタイル選択**: Select ドロップダウンではなく、視覚的なカード選択 UI（ラジオボタン + サムネイル）
- **Proof確認ページの CTA**: 「承認する」ボタンを目立つ primary color で強調、「修正依頼」は secondary

---

## 4. 技術制約

- **フレームワーク**: Next.js 14 App Router + TypeScript
- **スタイリング**: Tailwind CSS v4
- **UIコンポーネント**: shadcn/ui ベース（`components/ui/` を再利用・拡張）
- **MVPフェーズ**: アニメーションは最小限。複雑なカスタムコンポーネントより Tailwind + shadcn の拡張を優先
- **フォント**: Google Fonts は `next/font/google` で import する形式を使用

---

## 5. 現在のコード（改善対象）

### 5-1. グローバル設定

**`app/globals.css`**
```css
@import "tailwindcss";

@layer base {
  * {
    box-sizing: border-box;
  }
  body {
    @apply text-gray-900 bg-gray-50;
  }
}
```

**`tailwind.config.ts`**
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
```

**`app/layout.tsx`**
```typescript
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Memorial Items — ペットの額装アート',
  description: '大切なペットの写真をオーダーメイドの額装アートに。完全手作業による高品質な仕上がり。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  )
}
```

---

### 5-2. 共通コンポーネント

**`components/common/Nav.tsx`**
```typescript
import Link from 'next/link'

export function Nav() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">
          Memorial Items
        </Link>
        <nav className="flex gap-4 text-sm text-gray-600">
          <Link href="/examples" className="hover:text-gray-900">作例</Link>
          <Link href="/faq" className="hover:text-gray-900">FAQ</Link>
          <Link href="/order" className="rounded-md bg-gray-900 px-3 py-1.5 text-white hover:bg-gray-700">
            注文する
          </Link>
        </nav>
      </div>
    </header>
  )
}
```

**`components/common/Footer.tsx`**
```typescript
export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="mx-auto max-w-4xl px-4 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Memorial Items. All rights reserved.
      </div>
    </footer>
  )
}
```

---

### 5-3. LP（`app/page.tsx`）

```typescript
import Link from 'next/link'
import Image from 'next/image'
import { Nav } from '@/components/common/Nav'
import { Footer } from '@/components/common/Footer'
import { createClient } from '@/lib/supabase/server'
import { STYLES } from '@/lib/variants'
import { trackServer } from '@/lib/analytics'
import type { ContentExample } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  await trackServer('lp_viewed')

  const supabase = await createClient()
  const { data: examples } = await supabase
    .from('content_examples')
    .select('*')
    .eq('is_published', true)
    .order('sort_order')
    .limit(3)

  return (
    <>
      <Nav />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-white py-20 text-center px-4">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            大切なペットを、<br />一生残るアートに。
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
            写真を送っていただくだけ。職人が手作業で制作し、初稿をご確認いただいてから印刷・額装してお届けします。
          </p>
          <div className="mt-8">
            <Link
              href="/order"
              className="inline-block rounded-md bg-gray-900 px-8 py-3 text-base font-medium text-white hover:bg-gray-700"
            >
              注文する
            </Link>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16 px-4 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-10">ご注文の流れ</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { step: '1', title: 'お写真を送る', desc: 'お気に入りの写真を3〜5枚ご用意ください。顔がはっきり見えるものがおすすめです。' },
              { step: '2', title: '初稿をご確認', desc: '制作した初稿をご確認いただけます。気になる点があれば修正依頼をお送りください。' },
              { step: '3', title: 'お届け', desc: 'ご承認後、印刷・額装してお届けします。届いたその日から飾れます。' },
            ].map((item) => (
              <div key={item.step} className="rounded-lg border border-gray-200 bg-white p-6 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Styles */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-center mb-10">スタイル</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {STYLES.map((s) => (
                <div key={s.id} className="rounded-lg border border-gray-200 p-6">
                  <h3 className="font-semibold mb-1">{s.label}</h3>
                  <p className="text-sm text-gray-600">{s.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Examples */}
        {examples && examples.length > 0 && (
          <section className="py-16 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-semibold text-center mb-10">作例</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {examples.map((ex: ContentExample) => (
                  <div key={ex.id} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                    <div className="aspect-square relative bg-gray-100">
                      <Image
                        src={ex.image_url}
                        alt={ex.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    </div>
                    <div className="p-4">
                      <p className="font-medium text-sm">{ex.title}</p>
                      {ex.short_description && (
                        <p className="text-xs text-gray-500 mt-1">{ex.short_description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link href="/examples" className="text-sm text-gray-600 hover:text-gray-900 underline">
                  すべての作例を見る →
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-20 px-4 bg-gray-900 text-white text-center">
          <h2 className="text-2xl font-semibold mb-4">あなたのペットをアートに</h2>
          <p className="text-gray-300 mb-8">
            初稿確認後に印刷するので、仕上がりに安心してご注文いただけます。
          </p>
          <Link
            href="/order"
            className="inline-block rounded-md bg-white px-8 py-3 text-base font-medium text-gray-900 hover:bg-gray-100"
          >
            注文する
          </Link>
        </section>
      </main>
      <Footer />
    </>
  )
}
```

---

### 5-4. 注文フォーム（`components/order/OrderForm.tsx`）

```typescript
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
import { orderSchema, type OrderFormValues } from '@/lib/schemas/order'
import { STYLES, SIZES, FRAMES } from '@/lib/variants'
import { submitOrder } from '@/app/order/actions'

export function OrderForm() {
  const [photos, setPhotos] = useState<File[]>([])
  const [photoError, setPhotoError] = useState('')
  const [serverError, setServerError] = useState('')
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OrderFormValues>({ resolver: zodResolver(orderSchema) })

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
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="customer_name">お名前 *</Label>
          <Input id="customer_name" {...register('customer_name')} placeholder="山田 太郎" />
          {errors.customer_name && <p className="text-xs text-red-600">{errors.customer_name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="customer_email">メールアドレス *</Label>
          <Input id="customer_email" type="email" {...register('customer_email')} placeholder="you@example.com" />
          {errors.customer_email && <p className="text-xs text-red-600">{errors.customer_email.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pet_name">ペットのお名前 *</Label>
        <Input id="pet_name" {...register('pet_name')} placeholder="ポチ" />
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
        <Label htmlFor="must_keep_features">必ず残してほしい特徴 *</Label>
        <Textarea
          id="must_keep_features"
          {...register('must_keep_features')}
          placeholder="例: 鼻の周りの白い毛、左耳の折れ、目の琥珀色など"
          rows={3}
        />
        <p className="text-xs text-gray-500">制作で必ず反映します。できるだけ具体的にご記入ください。</p>
        {errors.must_keep_features && <p className="text-xs text-red-600">{errors.must_keep_features.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">その他ご要望（任意）</Label>
        <Textarea id="notes" {...register('notes')} placeholder="ご自由にご記入ください" rows={2} />
      </div>

      <div className="space-y-1.5">
        <Label>ペットの写真 *（3〜5枚）</Label>
        <PhotoUploader name="photos" onChange={setPhotos} error={photoError} />
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <Button type="submit" size="lg" disabled={isPending} className="w-full">
        {isPending ? '送信中...' : '注文を送信する'}
      </Button>
    </form>
  )
}
```

---

### 5-5. Proof確認ページのアクション部分（`components/proof/ProofReviewActions.tsx`）

```typescript
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
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
        <p className="font-medium text-green-800">✓ 承認済みです</p>
        <p className="text-sm text-green-700 mt-1">
          {enablePhysicalShipping
            ? '印刷・額装の手配を進めています。'
            : '完成画像はご注文詳細ページからダウンロードいただけます。'}
        </p>
      </div>
    )
  }

  if (message) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
        <p className="text-gray-700">{message}</p>
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
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" className="flex-1" onClick={handleApprove} disabled={isPending}>
            この内容で承認する
          </Button>
          <Button size="lg" variant="outline" className="flex-1" onClick={() => setMode('revision')} disabled={isPending}>
            修正依頼を送る
          </Button>
        </div>
      )}

      {mode === 'revision' && (
        <form onSubmit={handleRevisionSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="request_text">修正内容をご記入ください</Label>
            <Textarea
              id="request_text"
              name="request_text"
              rows={5}
              placeholder="例: 右耳の色をもう少し濃くしてほしい。目の表情が少し違う気がするので明るくしてほしい。"
              required
            />
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
```

---

### 5-6. バリアント定義（`lib/variants.ts`）

```typescript
export const STYLES = [
  { id: 'clean_illustration', label: 'クリーンイラスト', description: 'すっきりとした線画風、明るい色使い' },
  { id: 'soft_watercolor', label: 'やわらか水彩', description: 'ふんわりした水彩タッチ、温かみのある仕上がり' },
  { id: 'modern_portrait', label: 'モダンポートレート', description: 'モダンでスタイリッシュ、落ち着いた色調' },
] as const

export const SIZES = [
  { id: 'S', label: 'S（A4相当）', description: '約210×297mm' },
  { id: 'M', label: 'M（A3相当）', description: '約297×420mm' },
  { id: 'L', label: 'L（A2相当）', description: '約420×594mm' },
] as const

export const FRAMES = [
  { id: 'natural_wood', label: 'ナチュラルウッド', description: '明るい木目調の額縁' },
  { id: 'black', label: 'ブラック', description: 'シックな黒フレーム' },
  { id: 'white', label: 'ホワイト', description: '清潔感のある白フレーム' },
] as const
```

---

## 6. 改善リクエスト（Claude Design への依頼）

以下のファイルを改善してください。ロジック・バリデーション・Server Action は変更せず、**見た目（Tailwind クラス・フォント・構造）のみ**を変更してください。

### 優先度 High

1. **`app/layout.tsx`** — Google Fonts（`next/font/google`）を追加してください。見出しに Cormorant Garamond、本文に Noto Sans JP の組み合わせを推奨しますが、より適切な提案があればそちらでも構いません。CSS 変数でフォントを body に適用してください。

2. **`app/globals.css`** — カラーテーマを定義してください。温かみのある色調（stone/warm-gray ベース）を導入し、メインカラー・アクセントカラーを CSS 変数で定義してください。

3. **`components/common/Nav.tsx`** — ブランドロゴをより洗練された表示に。ナビ全体のデザインを現代的に改善してください。

4. **`app/page.tsx`（LP）** — 以下を改善してください:
   - Hero: コピーの感情訴求強化、背景色・配置の改善
   - Step セクション: より視覚的に魅力的なレイアウト
   - CTA セクション: 温かみのある配色に

5. **`components/proof/ProofReviewActions.tsx`** — 「承認する」ボタンを最重要アクションとして目立たせてください（サイズ・色・重み感）。

### 優先度 Medium

6. **`components/common/Footer.tsx`** — 最低限のデザイン改善（現在は空白に近い）

7. **`components/order/OrderForm.tsx`** — フォーム全体の雰囲気を温かみのあるものに。セクション分けを視覚的に明確に。

---

## 7. 変更してはいけないもの

- すべての Server Action（`'use server'` がついたファイル）
- `lib/` 以下のロジック・スキーマ・バリデーション
- `components/ui/` 以下の shadcn/ui コンポーネント本体
- `app/admin/` 以下の管理画面（デザイン改善対象外）
- URL・ルーティング・データフェッチのロジック

---

*このブリーフは `/Users/muroiyousuke/Projects/Memorial_Items/docs/design-brief.md` に保存されています。*
