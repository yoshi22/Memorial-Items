# 2026-05-03 03:00 — admin auth catch にエラー詳細表示を追加

## Summary
AdminSecurityCheck の catch ブロックでエラーが握りつぶされていたため、「認証情報の取得に失敗しました。再ログインしてください。」のみ表示されていた。一時的に `e.message` を画面に表示するよう変更し、原因特定を進める。

## Background
env.ts の動的アクセス修正・try/catch 追加・console.error 追加をデプロイ済みだが、依然として catch フォールバックが発火している。ブラウザ DevTools でコンソールエラーが確認できないため、エラー内容を直接画面に出力して調査する。

## Changes
- `components/admin/security/AdminSecurityCheck.tsx` — catch 句で `e.message` を `setMessage` に含めるよう変更

## Decisions
- 一時的な調査用変更。原因が特定でき次第、適切なエラーメッセージに戻す

## Validation
- `npm run typecheck`: エラーなし

## Open Issues
- 根本原因未特定

## Next Steps
- `npx vercel --prod` でデプロイ
- magic link クリック後の画面に表示されるエラー詳細を確認し、根本原因を特定する
