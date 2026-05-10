# vercel_deploy.md

## Purpose
Vercel 上で一時テスト公開し、外部から実際に注文フローと管理フローを検証するための手順。

## Prerequisites
- Vercel account
- Supabase project
- Brevo account (メール送信を確認したい場合)

## Required env vars
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_BASE_URL`
- `ADMIN_EMAILS`
- `EMAIL_FROM`

## Optional env vars
- `BREVO_API_KEY`
- `POSTHOG_KEY`
- `BANK_TRANSFER_BANK_NAME`（Phase 1〜）
- `BANK_TRANSFER_BRANCH_NAME`（Phase 1〜・任意）
- `BANK_TRANSFER_ACCOUNT_TYPE`（Phase 1〜・任意）
- `BANK_TRANSFER_ACCOUNT_NUMBER`（Phase 1〜）
- `BANK_TRANSFER_ACCOUNT_HOLDER`（Phase 1〜）
- `BANK_TRANSFER_REFERENCE`（Phase 1〜・任意）
- `PAYPAY_PAYMENT_URL`（Phase 2〜・任意）
- `PAYPAY_QR_IMAGE_URL`（Phase 2〜・任意）
- `STRIPE_PAYMENT_LINK_URL`（Phase 3〜）
- `ENABLE_PHYSICAL_SHIPPING`

## Minimum production-ready env vars
公開 URL で最低限の実運用テストを成立させるには、上の必須 env に加えて次も投入する。

- `BREVO_API_KEY`
- `BANK_TRANSFER_BANK_NAME` / `BANK_TRANSFER_ACCOUNT_NUMBER` / `BANK_TRANSFER_ACCOUNT_HOLDER`

未設定でもアプリ自体は表示されるが、次の制約が残る。

- メール通知は送られない
- 振込案内が出ない（口座 3 項目が最低条件）

## Vercel setup
1. リポジトリを Vercel に import
2. Framework preset は Next.js のままにする
3. Environment Variables に必要な値を投入する
4. `APP_BASE_URL` は公開 URL にする
   - 例: `https://memorial-items-preview.vercel.app`
5. Deploy を実行する

## Supabase setup
1. Authentication > URL Configuration を開く
2. Site URL に `APP_BASE_URL` と同じ URL を設定する
3. Redirect URLs に `https://<your-domain>/auth/callback` を追加する
4. 以下の Storage bucket が存在することを確認する
   - `customer-uploads`
   - `proofs`
   - `print-masters`
   - `examples`

## Brevo setup
- Brevo（旧 Sendinblue）は独自ドメインなしで任意のメールアドレス宛に送信可能（無料 300 通/日）
- `EMAIL_FROM` に Brevo 登録済みの送信者アドレス（Gmail 等可）を設定する
- `BREVO_API_KEY` または `EMAIL_FROM` 未設定時、メール処理は no-op になる
- 独自ドメインを取得した際は Brevo でドメイン認証すると到達率が向上する

## Payment setup
- Phase 1（実施済み）: `BANK_TRANSFER_*` env 6 項目を追加すると振込案内が有効になる
- Phase 2（実装済み・保留中）: `PAYPAY_PAYMENT_URL` または `PAYPAY_QR_IMAGE_URL` を追加すると PayPay 案内が追加される
- Phase 3: `STRIPE_PAYMENT_LINK_URL` を追加するとクレジットカード案内が追加される
- 各 Phase はコード変更不要・env 追加のみで切り替わる
- MVP では支払い確認は admin が `payment_status` を更新して管理する

## Smoke test
- `/` が表示される
- `/order` から注文送信できる
- 注文後に `/order/submitted/[token]` へ遷移する
- `/admin/login` で管理者 magic link を送れる
- `/admin/orders` に入れる
- 管理画面から proof をアップロードできる
- `/p/[token]` で承認または修正依頼ができる
- `/o/[token]` で注文状況を確認できる

## Notes
- `supabase/config.toml` の URL はローカル開発用であり、本番設定には使わない
- Google Fonts を使っているため、ローカルの閉域環境では build に失敗することがある。Vercel 上の build 成功を基準に確認する
- `https://memorial-items.vercel.app` を本番 URL として使う場合、Supabase Auth の `Site URL` も同じ URL に合わせる

## 重要: NEXT_PUBLIC_* 環境変数と build cache

`NEXT_PUBLIC_*` 変数（`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`）は **build 時に client bundle へ inline** される。

- Vercel Dashboard で追加・変更した後は **必ず再ビルド**が必要
- `npx vercel --prod` は前回の build cache を再利用する場合がある
- 確実に反映するには `Deployments` → 最新 → **Redeploy（"Use existing Build Cache" を OFF）**
- または `npx vercel --prod --force` でキャッシュを無視したビルドを実行する

## 重要: Supabase Custom SMTP（Brevo）設定

Supabase Auth のメール送信は Free プランのデフォルト SMTP では 4 通/時の制限がある。
本番では Brevo Custom SMTP を使用する:

1. Brevo Dashboard → Settings → SMTP & API → **SMTP** タブ → SMTP key を発行
2. Supabase Dashboard → Project Settings → Authentication → **SMTP Settings**
3. 設定値:
   - Host: `smtp-relay.brevo.com`
   - Port: `587`
   - Username: SMTP ページに表示される専用 login（例: `a9e3fb001@smtp-brevo.com`）※アカウントメールではない
   - Password: 発行した SMTP key
