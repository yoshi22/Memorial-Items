# security_acceptance_checklist.md

## Purpose
実運用開始前に、管理画面セキュリティと運用上の最低要件が満たされているか確認する。

## Target environment
- App URL: `https://memorial-items.vercel.app`

## Preconditions
- `ADMIN_BASIC_AUTH_USERNAME` / `ADMIN_BASIC_AUTH_PASSWORD` が Production に設定済み
- `ADMIN_EMAILS` に管理者メールが含まれている
- `SECURITY_ALERT_EMAILS` が設定済み
- Supabase Auth で管理者ユーザーが作成済み

## Checks

### 1. Basic auth
- `https://memorial-items.vercel.app/admin/login` を開く
- Basic auth のダイアログが表示されることを確認する
- 誤った資格情報では先に進めないことを確認する

### 2. Magic link + allowlist
- 正しい Basic auth 後に admin login page が開く
- 許可済みメールで magic link を送信できる
- 未許可メールでは generic success 表示になり、管理画面へは入れない

### 3. MFA enrollment
- 新規管理者で login すると `/admin/security/enroll-mfa` に進む
- QR を authenticator app で読める
- 正しい 6 桁コードで `/admin/orders` に入れる
- セキュリティ通知メールが届く

### 4. MFA verification
- 既存管理者で login すると `/admin/security/verify-mfa` に進む
- 正しいコードで `/admin/orders` に入れる
- `MFA verified` 表示が header にある

### 5. Lockout
- MFA コードを 10 回連続で誤入力する
- ロックメッセージが表示される
- ロック中は magic link 再送も拒否される

### 6. Upload restrictions
- order photo に JPEG/PNG/WebP/HEIC 以外を渡すと拒否される
- proof に JPEG/PNG/WebP 以外を渡すと拒否される
- examples image に JPEG/PNG/WebP 以外を渡すと拒否される

### 7. Security headers
- `/` と `/admin/login` に以下ヘッダーがある
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Content-Security-Policy`
  - `Referrer-Policy`

### 8. 振込先情報の露出確認
- `BANK_TRANSFER_*` の値がソースコード / git 履歴に含まれていない（env のみで管理されている）
- 振込先口座情報がサーバーログやエラーログに出力されていない
- `/o/[token]` の振込案内が未払い状態のときのみ表示される（支払い済みでは非表示になる）

## Result template
- 実施日:
- 実施者:
- 結果: Pass / Fail
- 失敗箇所:
- 補足:
