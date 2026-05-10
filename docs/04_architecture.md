# 04_architecture.md

## Architecture summary
このシステムは、顧客向けの注文体験と、管理者向けの制作・納品オペレーション管理を一体で扱う。
画像生成AIそのものはアプリ内に実装せず、外部制作ツールを使った manual-first 運用を前提とする。

## Main surfaces

### Customer-facing
- LP
- examples
- FAQ
- order form
- order status page (token access)
- proof review page (token access)

### Admin-facing
- login
- orders list
- order detail
- content management
- settings

## High-level flow
1. 顧客が注文フォーム送信
2. DB に order 作成
3. 画像ファイルを Storage に保存
4. 管理者が order を確認し、制作対象写真を選ぶ
5. 外部ツールで初稿制作
6. proof を Storage にアップロード
7. 顧客が proof page で承認 or 修正依頼
8. 管理者が修正対応
9. 最終承認後に print master を Storage に保存
10. 印刷/額装/発送
11. 追跡番号登録、完了

## Tech choices
- Next.js App Router
- TypeScript
- Supabase Auth / Postgres / Storage
- Brevo（旧 Sendinblue）
- PostHog
- Vercel

## Data model overview

### orders
注文の親レコード。
顧客情報、商品仕様、支払い方法、状態、支払い状態、トークンなどを保持。

### order_images
顧客がアップロードした原本画像。
複数枚保持可能。

### art_assets
制作工程で使う画像資産。
asset_type:
- reference
- selected_reference
- proof
- print_master

### proofs
顧客確認用の初稿/修正版。
version を持つ。

### revision_requests
proof に対する修正依頼履歴。

### admin_notes
管理者メモ。

### content_examples
作例コンテンツ。

### faq_items
FAQ コンテンツ。

## Auth and access control
### Admin
- Supabase Auth 必須
- admin role 前提
- 管理画面 URL は認証ガード

### Customer
- ログイン不要
- `public_order_token`, `public_proof_token` によるアクセス
- トークンは長く推測困難なランダム値を使う

## Storage design
Storage bucket を少なくとも以下で分ける。
- customer-uploads
- proofs
- print-masters
- examples

### Access principles
- customer-uploads: 非公開
- proofs: 非公開、署名URLまたはサーバー経由配信
- print-masters: 非公開
- examples: 公開可

## Notifications
最低限必要な通知:
- 注文受付
- 新規注文（admin 向け）
- proof ready
- proof approved
- revision received
- revision requested（admin 向け）
- payment confirmed
- shipped

## Status model
order status:
- new
- in_review
- proof_uploaded
- revision_requested
- approved
- in_production
- shipped
- completed
- cancelled

payment status:
- unpaid
- pending
- paid
- refunded

payment method:
- unknown（レガシー値）
- bank_transfer（Phase 1〜）
- paypay_qr（Phase 2〜）
- credit_card（Phase 3〜）

## Future model notes（memo, not a commitment）

このセクションは現時点で実装しない内容の備忘録。今後の物理商品追加時に参照する想定。

- **商品種別**: 現状は `orders.style/size/frame` の組合せが事実上の SKU。物理商品（キャンバス・アクリル等）追加検討時には `product_type`（例: `digital` / `canvas` / `acrylic`）と `price_jpy` 列の追加案あり。**現時点では追加しない**
- **配送先住所**: `orders` には現状未保持（`customer_name` / `customer_email` のみ）。物理配送 GA 検討時に追加する候補。**現時点では追加しない**
- **外注ベンダー識別**: 物理商品追加時に `fulfillment_vendor` 列を持つ案あり。**現時点では追加しない**

## Non-goals in architecture
- workflow engine
- job queue
- microservices
- complex ACL system
- generalized product/catalog model
- automated image generation orchestration

## Environment variables
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- APP_BASE_URL
- ADMIN_EMAILS
- EMAIL_FROM
- BREVO_API_KEY
- POSTHOG_KEY
- BANK_TRANSFER_BANK_NAME（Phase 1〜）
- BANK_TRANSFER_BRANCH_NAME（Phase 1〜）
- BANK_TRANSFER_ACCOUNT_TYPE（Phase 1〜）
- BANK_TRANSFER_ACCOUNT_NUMBER（Phase 1〜）
- BANK_TRANSFER_ACCOUNT_HOLDER（Phase 1〜）
- BANK_TRANSFER_REFERENCE（Phase 1〜）
- PAYPAY_PAYMENT_URL（Phase 2〜・任意）
- PAYPAY_QR_IMAGE_URL（Phase 2〜・任意）
- STRIPE_PAYMENT_LINK_URL（Phase 3〜）

## Design principle
システムの責務は「画像を作ること」ではなく、「画像制作を管理し、顧客確認と納品を安全に回すこと」。
