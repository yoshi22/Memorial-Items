# 2026-05-03 04:00 — 管理者認証フロー全修正と MVP E2E テスト完了

## Summary
管理者 magic link 認証が通らない問題を複数段階で修正し、MVP の E2E テスト（注文受付〜入金確認）を全 Phase Pass で完了した。

## Background
本番環境で以下の症状が連続して発生していた：
1. 注文受付メールが任意のメールアドレスに届かない
2. 管理者 magic link が届かない（「メールの送信に失敗しました」）
3. magic link クリック後に `?error=auth_failed`
4. auth_failed は解消されたが React error boundary が発火
5. MFA QR コードが表示されない / 読み取れない

## Changes（セッション全体）

### メールプロバイダ移行（2026-05-01）
- `lib/email.ts` — Resend SDK → Brevo BrevoClient に書き換え
- `lib/env.ts` — `resendApiKey` → `brevoApiKey`
- `package.json` — `resend` 削除、`@getbrevo/brevo` 追加
- 各種ドキュメント・env を Brevo に更新

### Supabase Custom SMTP 設定（ユーザー作業）
- Brevo SMTP key を発行し Supabase Dashboard に登録
- Username は SMTP ページの専用 login（`a9e3fb001@smtp-brevo.com`）を使用

### auth callback エラーログ追加
- `app/auth/callback/route.ts` — `exchangeCodeForSession` 失敗時に `console.error` を追加

### NEXT_PUBLIC_* 静的アクセス修正（根本原因修正）
- `lib/env.ts` — `process.env[name]`（動的）→ `process.env.NEXT_PUBLIC_SUPABASE_URL`（静的）に変更
  - Next.js は動的インデックスを build 時に inline しないため、client bundle で常に undefined になっていた
  - `requireFromValue(name, value)` ヘルパーを追加

### AdminSecurityCheck / AdminMfaVerify 防御的修正
- useEffect の IIFE を try/catch で包み、env 欠落時に UI フォールバックを表示

### MFA QR コード PNG 生成
- `components/admin/security/AdminMfaEnroll.tsx`
  - Supabase 提供の SVG QR（Chrome / Authenticator アプリ非対応）を廃止
  - `data.totp.uri` から `qrcode` ライブラリで PNG data URL を生成
- `package.json` — `qrcode` / `@types/qrcode` 追加

## Decisions
- `lib/env.ts` の `requireEnv` / `readEnv` はサーバ専用 env で引き続き使用するため残す
- `NEXT_PUBLIC_*` 追加・変更後は "Use existing Build Cache" OFF での再デプロイが必要（vercel_deploy.md に追記）
- QR コードは qrcode の PNG 出力が最も Authenticator アプリ互換性が高い

## Validation
- `npm run typecheck`: エラーなし
- `npm run test`: 48 件全件 pass
- MVP E2E テスト: Phase 1〜5 すべて Pass（2026-05-03 実施）

## Open Issues
- Brevo SMTP の 300 通/日制限（月次でダッシュボード確認推奨）
- Brevo 無料プランの送達率（Gmail 送信元の場合、スパム判定リスク）

## Next Steps
- 本番運用開始
- 月次 Brevo 利用量確認
