# 2026-05-03 02:00 — admin auth クライアント側 env 欠落による error boundary 修正

## Summary
`NEXT_PUBLIC_SUPABASE_URL` が Vercel 本番ビルドに inline されておらず、magic link クリック後に `AdminSecurityCheck` の useEffect で `requireEnv` が throw し React error boundary が発火していた。Vercel env の補正と再デプロイで根本修正。合わせて client-side MFA 系コンポーネント 2 件の useEffect に try/catch を追加して再発時の fallback を改善。

## Background
SMTP 設定修正（Brevo Custom SMTP）により magic link の届きと `exchangeCodeForSession` は正常になった。しかし magic link クリック後、`/admin/security/check` が 200 を返した直後にブラウザで `app/error.tsx` が表示されていた。Vercel には `/admin/security/enroll-mfa` / `/admin/security/verify-mfa` のログが存在しないことから、`router.replace` 前にクライアント側で例外が発生していると判定。ブラウザ console に `Error: Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL` が出ていることで確定。

## Changes
- `components/admin/security/AdminSecurityCheck.tsx` — useEffect の IIFE を try/catch で包み、env 欠落・Supabase 初期化失敗時に `setMessage` でフォールバック
- `components/admin/security/AdminMfaVerify.tsx` — 同様に useEffect の IIFE を try/catch で包み、catch 時に `setError` でフォールバック（`AdminMfaEnroll.tsx` の既存パターンに合わせる）
- Vercel Production env: `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` を補正 → build cache OFF で再デプロイ（ユーザー作業）

## Decisions
- env.ts の `requireEnv` は変更しない（server 側で欠落を早期検知する既存の設計は維持）
- try/catch は useEffect 全体を包む形にする（`AdminMfaEnroll.tsx` と同一パターン）
- `app/error.tsx` は既に `digest` 表示ロジックあり、追加変更不要と判定

## Validation
- `npm run typecheck`: エラーなし
- `npm run test`: 48 件全件 pass

## Open Issues
- `NEXT_PUBLIC_*` 追加・変更後は必ず build cache OFF redeploy が必要。vercel_deploy.md への注記は別途実施

## Next Steps
- Vercel Dashboard で `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` の scope を確認・補正
- `Deployments` から build cache OFF で Redeploy
- 本コードを含む再デプロイ: `npx vercel --prod`
- 管理者 magic link E2E 再確認（`/admin/orders` まで到達できることを確認）
