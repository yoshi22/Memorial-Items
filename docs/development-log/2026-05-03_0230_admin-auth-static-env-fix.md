# 2026-05-03 02:30 — lib/env.ts の NEXT_PUBLIC_* 動的アクセス修正

## Summary
`lib/env.ts` の `readEnv` が `process.env[name]`（動的インデックス）で env を取得していたため、Next.js の Turbopack が `NEXT_PUBLIC_*` を client bundle に inline できなかった。`process.env.NEXT_PUBLIC_SUPABASE_URL` のようなドット記法の静的アクセスを使う `requireFromValue` ヘルパーを追加し、`supabaseUrl` / `supabaseAnonKey` の getter を変更した。

## Background
SMTP 修正後、magic link 配送・`exchangeCodeForSession` は正常になったが、magic link クリック後にブラウザが React error boundary を表示し続けた。ブラウザ console に `Error: Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL` が出ており、`AdminSecurityCheck` の useEffect 内で `createBrowserClient()` を呼ぶ際に throw していた。Vercel Production に env を確認してもあり、build cache OFF で redeploy しても改善せず、コードを調査したところ動的インデックス（`process.env[name]`）が原因であることが判明した。

Next.js / Webpack DefinePlugin / Turbopack は `NEXT_PUBLIC_*` を**静的アクセス（ドット記法）のみ** build 時に inline する。動的インデックスはバンドル内で undefined のまま残る（server runtime は Node.js が process.env を実オブジェクトとして保持するため問題なし）。

## Changes
- `lib/env.ts` — `requireFromValue(name, value)` ヘルパー追加（value として静的 `process.env.NEXT_PUBLIC_*` を渡す形）。`supabaseUrl` / `supabaseAnonKey` getter を `requireFromValue` 経由に変更。他の server-only env は既存の `readEnv`/`requireEnv` のまま。

## Decisions
- `requireEnv` / `readEnv` は削除しない（サーバ専用 env に引き続き利用）
- 変更対象は `NEXT_PUBLIC_*` に限定（他の env は server runtime に解決されるため影響なし）
- `APP_BASE_URL` は server-only（`app/` の Server Component から参照）なので変更不要

## Validation
- `npm run typecheck`: エラーなし
- `npm run test`: 48 件全件 pass

## Open Issues
- なし

## Next Steps
- `npx vercel --prod` でデプロイ
- magic link ログイン → `/admin/orders` 到達を確認
