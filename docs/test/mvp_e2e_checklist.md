# mvp_e2e_checklist.md

## Purpose
本番公開中の `Memorial Items` で、MVP として必要な主要導線が実際に動くかを 1 件通しで確認する。

## Target environment
- App URL: `https://memorial-items.vercel.app`
- 対象リリース: `docs/specs/current_release.md`

## Success criteria
- 顧客が注文を送信できる
- 顧客が支払い方法を選択できる
- 管理者が magic link でログインできる
- 管理画面で注文詳細と顧客画像を確認できる
- 管理者が proof をアップロードできる
- 顧客が proof を閲覧し、承認または修正依頼を送れる
- 公開注文ページで顧客アップロード画像が見えない
- 承認後に顧客が注文詳細ページから完成画像へ到達できる

## Preconditions
- `APP_BASE_URL` が `https://memorial-items.vercel.app` になっている
- Supabase Auth の `Site URL` が `https://memorial-items.vercel.app`
- Supabase Auth の `Redirect URL` に `https://memorial-items.vercel.app/auth/callback` が入っている
- `ADMIN_EMAILS` にテスト用管理者メールアドレスが含まれている
- Storage bucket `customer-uploads`, `proofs`, `print-masters`, `examples` が存在する
- テスト用のペット写真を 3〜5 枚用意している
- proof 用画像を 1 枚用意している
- 可能なら `BREVO_API_KEY` を本番 env に設定している
- `BANK_TRANSFER_BANK_NAME`, `BANK_TRANSFER_ACCOUNT_NUMBER`, `BANK_TRANSFER_ACCOUNT_HOLDER` が設定されている
- PayPay テストをする場合（Phase 2 再開後）: `PAYPAY_PAYMENT_URL` または `PAYPAY_QR_IMAGE_URL` が設定されている

Related setup doc:
- `docs/test/payment_setup_walkthrough.md`（Part 1: 振込先設定）

## Recommended test data

### 銀行振込テスト
- customer_name: `E2E Test Customer`
- customer_email: 自分で受信できるメールアドレス
- pet_name: `Mugi`
- style: 任意
- size: 任意
- frame: 任意
- payment_method: `bank_transfer`
- must_keep_features: `耳の形と目の色を残したい`
- notes: `E2E test order - bank transfer`

### PayPay テスト（Phase 2 再開後、`PAYPAY_PAYMENT_URL` または `PAYPAY_QR_IMAGE_URL` 設定済みの場合）
- 上記と同じ、payment_method のみ `paypay_qr` に変更
- notes: `E2E test order - paypay`

## Phase 1: Landing page and order entry

### 1. Landing page
- ブラウザで `https://memorial-items.vercel.app/` を開く
- ヒーロー、作例、CTA が崩れず表示されることを確認する
- `注文する` CTA から `/order` に遷移する

Expected:
- ページが 200 で表示される
- `注文フォーム` ページへ遷移する

### 2. Submit an order
- 注文フォームに推奨テストデータを入力する
- 支払い方法を選択する
- ペット写真を 3〜5 枚アップロードする
- 送信する

Expected:
- エラーが出ず、`/order/submitted/[token]` に遷移する
- 完了メッセージが表示される
- 注文詳細 URL が主要 CTA として露出しない
- 選択した支払い方法に応じた支払い案内が表示される

Record:
- 発行された注文 token URL
- 送信時刻

### 3. Verify customer order detail
- 注文受付メールに記載された URL から `/o/[token]` を開く
- 注文内容と進行状況が表示されることを確認する

Expected:
- 注文仕様が表示される
- 顧客アップロード画像が表示されない
- ステータスが初期状態で確認できる
- 支払い方法に応じた支払い案内が表示される

## Phase 2: Admin login and order review

### 4. Admin magic link login
- `https://memorial-items.vercel.app/admin/login` を開く
- Basic auth を通過する
- `ADMIN_EMAILS` に含まれる管理者メールアドレスを入力する
- `ログインリンクを送る` を押す
- 受信メールのリンクを開く
- 初回は `/admin/security/enroll-mfa`、以降は `/admin/security/verify-mfa` で TOTP を完了する

Expected:
- `/auth/callback` を経由して MFA 完了後に `/admin/orders` に到達する
- `unauthorized` や `auth_failed` にならない

Failure notes:
- ログイン画面に戻る場合は Supabase Auth の URL 設定を再確認する
- `管理者権限がありません` が出る場合は `ADMIN_EMAILS` を確認する

### 5. Verify order list and detail
- `/admin/orders` に新しい注文が表示されることを確認する
- 該当注文の `詳細` を開く

Expected:
- 顧客名、ペット名、注文日時が一覧に出る
- 詳細ページで顧客情報、注文仕様、顧客画像、支払い方法を確認できる
- 顧客向けの注文詳細 URL と proof URL が表示される

## Phase 3: Proof upload and customer review

### 6. Upload first proof
- 管理画面の注文詳細で `ProofUploader` を使い proof 画像を 1 枚アップロードする
- 必要なら production notes も入力する

Expected:
- proof 一覧に `v1` が表示される
- UI 上で `初稿 v1` と分かる
- 注文ステータスが `proof_uploaded` へ進む
- 顧客向け proof URL `/p/[token]` が有効になる
- 顧客と管理者に proof 関連メールが届く

### 7. Verify proof page as customer
- 顧客向け proof URL `/p/[token]` を開く
- proof 画像と制作メモが見えることを確認する

Expected:
- 最新 proof が表示される
- `承認` と `修正依頼` の操作ができる

### 8A. Revision request path
- まず修正依頼の導線を試す場合は、修正文を入力して送信する

Expected:
- エラーなく送信できる
- 画面上で修正依頼済みと分かる
- 管理画面に修正履歴が追加される
- 管理者に修正依頼メールが届く

### 8B. Approval path
- 最終確認として `承認` を実行する

Expected:
- 承認が保存される
- 注文ステータスが `approved` になる
- 顧客向け `/o/[token]` で承認済み表示に変わる
- 管理者に承認通知メールが届く

## Phase 4: Digital delivery confirmation

### 9. Verify approved order detail
- 承認後に再度 `/o/[token]` を開く

Expected:
- `承認済み` 表示になる
- `ENABLE_PHYSICAL_SHIPPING=false` の場合は完成画像のダウンロード導線が表示される
- `完成画像を開く・保存する` が動く

### 10. Verify payment status update
- 管理画面に戻り、payment status を更新する

Expected:
- 注文詳細に反映される
- 必要に応じて管理者メモが残る
- `paid` に更新した場合、顧客に支払い確認メールが届く

## Optional checks

### Email notifications
前提:
- Vercel に `BREVO_API_KEY` が設定されている
- `EMAIL_FROM` が有効な sender になっている

Checks:
- 注文受付メールが届く
- 新規注文の管理者通知メールが届く
- proof ready メールが届く
- 修正依頼の管理者通知メールが届く
- 承認完了メールが届く
- 承認完了の管理者通知メールが届く
- 支払い確認メールが届く

### Analytics
前提:
- Vercel に `POSTHOG_KEY` が設定されている

Checks:
- `lp_viewed`, `order_submitted`, `proof_viewed`, `proof_approved`, `revision_requested` が記録される

## Go / No-Go decision

### Go
- Phase 1 から Phase 4 までが無理なく通る
- 管理者ログインが安定している
- 顧客向け token URL がメール中心で機能している
- 公開ページで顧客画像が露出しない

### No-Go
- 注文送信に失敗する
- 管理者 magic link が本番 URL に戻らない
- proof upload または approval が保存されない
- 承認後に顧客が完成画像へ到達できない

## Test report template
- 実施日:
- 実施者:
- App URL:
- Order token:
- Proof token:
- 結果: Pass / Fail
- 失敗箇所:
- 補足メモ:

---

## Test report — 2026-05-03

- 実施日: 2026-05-03
- 実施者: muroi.y22@gmail.com
- App URL: https://memorial-items.vercel.app
- 結果: **Pass**

### Phase 結果

| Phase | 内容 | 結果 |
|-------|------|------|
| 1 | Landing page & 注文送信 | ✅ Pass |
| 2 | 管理者 magic link ログイン + MFA 登録 | ✅ Pass |
| 3 | Proof アップロード・顧客通知メール | ✅ Pass |
| 4 | 顧客 Proof 確認（承認） | ✅ Pass |
| 5 | 入金確認・顧客通知メール | ✅ Pass |

### 本番到達までに解消した問題

1. **注文受付メールが任意アドレスに届かない** → Resend から Brevo に移行
2. **magic link が届かない（SMTP レート制限）** → Supabase Custom SMTP を Brevo SMTP で設定
3. **magic link クリック後 error boundary** → `lib/env.ts` の `NEXT_PUBLIC_*` を動的インデックスから静的アクセスに修正
4. **MFA QR コードが表示されない / スキャンできない** → `qrcode` ライブラリで PNG 生成に変更

### 補足メモ

- `NEXT_PUBLIC_*` は build 時 inline のため、追加後は build cache を使わず再ビルドが必要
- Supabase SMTP Username は Brevo のアカウントメールではなく SMTP ページに表示される専用 login（例: `a9e3fb001@smtp-brevo.com`）
