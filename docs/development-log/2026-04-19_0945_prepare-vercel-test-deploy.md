# 2026-04-19 09:45 — prepare vercel test deploy

## Summary
インターネット上で一時テスト公開しやすくするため、環境変数の扱いを厳格化し、メール送信元を設定化した。あわせて Vercel と Supabase を前提にした公開手順を追加した。

## Background
ローカル前提の設定が残っており、公開 URL や Auth redirect の設定漏れでデプロイ後に詰まりやすい状態だった。特に `APP_BASE_URL`、管理者メール、メール sender の前提を明示する必要があった。

## Changes
- `lib/env.ts` — 必須 env を getter 経由で検証するように変更し、`EMAIL_FROM` を追加
- `lib/email.ts` — Resend の sender を env 化
- `README.md` — Vercel 一時公開向けの手順と env を追記
- `docs/04_architecture.md` — 公開時に必要な env 一覧を更新
- `docs/runbooks/local_dev.md` — ローカル用 env 一覧を更新
- `docs/runbooks/vercel_deploy.md` — Vercel / Supabase / Resend の手順書を新規追加
- `supabase/config.toml` — ローカル専用設定であることを注記

## Decisions
- `APP_BASE_URL` と Supabase 接続情報は必須 env とした。公開 URL の未設定はログインリンクやメール導線を壊すため。
- `EMAIL_FROM` は env 化しつつ、一時テストでは `onboarding@resend.dev` を fallback にした。独自ドメイン未整備でも検証を始められるようにするため。
- Supabase の本番 redirect URL は `config.toml` ではなく Dashboard 設定を正とした。環境ごとの差し替えを簡単にするため。

## Validation
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build` は失敗
  - 原因は `next/font/google` による Google Fonts 取得失敗で、閉域の実行環境制約によるもの
- `npx vercel deploy --prod --yes`
  - Production URL: `https://memorial-items.vercel.app`
- `curl -I https://memorial-items.vercel.app/`
- `curl -I https://memorial-items.vercel.app/order`
- `curl -I https://memorial-items.vercel.app/admin/login`

## Open Issues
- この環境では Google Fonts に接続できず `npm run build` が完了しない
- Supabase Dashboard 側の Site URL / Redirect URL は別途 `https://memorial-items.vercel.app` と `https://memorial-items.vercel.app/auth/callback` に合わせる必要がある

## Next Steps
- Supabase Auth の Site URL / Redirect URL を Vercel URL に合わせる
- 必要なら Resend の検証済み sender に `EMAIL_FROM` を切り替える
