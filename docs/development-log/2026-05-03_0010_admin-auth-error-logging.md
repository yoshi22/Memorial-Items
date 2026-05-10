# 2026-05-03 00:10 — admin auth callback にエラーログを追加

## Summary
`/auth/callback` で `exchangeCodeForSession` が失敗した際、エラー詳細が何も記録されていなかった。`console.error` を追加して Vercel ログで原因を特定できるようにした。

## Background
管理者の magic link 認証が `?error=auth_failed` で失敗する事象を調査中。`route.ts` はエラー時に即リダイレクトするだけでメッセージを記録しておらず、原因切り分けができなかった。

## Changes
- `app/auth/callback/route.ts` — `exchangeCodeForSession` 失敗時に `console.error('Auth callback exchange failed:', error.message, error)` を追加

## Decisions
- エラー内容を `searchParams` に露出しない（セキュリティ上 UI に詳細は不要）
- サーバサイドログのみに記録することで、Vercel ログで原因特定できるようにした

## Validation
- `npm run typecheck`: エラーなし
- `npm run test`: 48 件全件 pass

## Open Issues
- 根本原因（Supabase デフォルト SMTP のレート制限）は別途 Supabase Custom SMTP 設定で対処する

## Next Steps
- Supabase Dashboard で Brevo Custom SMTP を設定する（ユーザー作業）
- `npx vercel --prod` でデプロイする
