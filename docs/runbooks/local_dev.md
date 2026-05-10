# local_dev.md

## Purpose
ローカルで開発環境を立ち上げるための手順。

## Prerequisites
- Node.js LTS
- pnpm or npm
- Supabase project
- Vercel account (optional for preview)
- Brevo account
- PostHog project (optional in local)

## Setup steps
1. リポジトリを clone
2. 依存関係を install
3. `.env.local` を作成
4. Supabase migration を適用
5. seed 実行（必要時）
6. dev server 起動

## Required env vars
- NEXT_PUBLIC_SUPABASE_URL=
- NEXT_PUBLIC_SUPABASE_ANON_KEY=
- SUPABASE_SERVICE_ROLE_KEY=
- APP_BASE_URL=http://localhost:3000
- ADMIN_EMAILS=your-admin@example.com
- EMAIL_FROM=
- BREVO_API_KEY=
- POSTHOG_KEY=
- BANK_TRANSFER_BANK_NAME=テスト銀行
- BANK_TRANSFER_BRANCH_NAME=テスト支店
- BANK_TRANSFER_ACCOUNT_TYPE=普通
- BANK_TRANSFER_ACCOUNT_NUMBER=1234567
- BANK_TRANSFER_ACCOUNT_HOLDER=テスト　タロウ
- BANK_TRANSFER_REFERENCE=ペット名をご記入ください
- PAYPAY_PAYMENT_URL=
- PAYPAY_QR_IMAGE_URL=
- STRIPE_PAYMENT_LINK_URL=

## Commands
- install: `npm install`
- dev: `npm run dev`
- lint: `npm run lint`
- test: `npm run test`

## Local checks
- LP が表示される
- 注文フォームが開ける
- 画像アップロードが通る
- admin login が通る
- proof page が token 経由で見られる

## Common issues
### Supabase auth not working
- env が正しいか確認
- redirect URL 設定確認

### Upload failing
- storage bucket policy を確認
- file size / MIME validation を確認

### Emails not sending
- Brevo API key と EMAIL_FROM の設定を確認（どちらか未設定で no-op になる）
