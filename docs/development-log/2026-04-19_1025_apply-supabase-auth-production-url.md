# 2026-04-19 10:25 — apply supabase auth production url

## Summary
Supabase の linked project に対して Auth の Site URL と Redirect URL を本番公開 URL に合わせて反映した。あわせて、初回 `config push` で意図せず変わった Auth の既存設定を元の値へ戻した。

## Background
Vercel 側の公開は完了していたが、Supabase Auth の URL 設定が `localhost` 前提のままだと、管理者 magic link ログインや認証コールバックが公開 URL に戻れない状態だった。

## Changes
- linked project `gdwlrvhxkppbszylahvt` に対して remote Auth config を更新
- `site_url` を `https://memorial-items.vercel.app` に設定
- `additional_redirect_urls` を `["https://memorial-items.vercel.app/auth/callback"]` に設定
- 初回 push で変わった `auth.email` / `auth.mfa.totp` / `api.schemas` の差分を、意図した値へ補正して再 push

## Decisions
- repo 内の `supabase/config.toml` はローカル開発用のまま維持した
- remote 反映は `/tmp` の一時 workdir を使って行い、production 用 URL だけを適用した
- `config push` が Auth 全体を更新するため、URL 以外の差分も必ず検査し、意図しない変更は同 turn で補正した

## Validation
- `supabase projects list` で linked project を確認
- `supabase config push --workdir /tmp/memorial-items-supabase --yes`
- `supabase config push --workdir /tmp/memorial-items-supabase-fix2 --yes`
- 再確認で `Remote Auth config is up to date.` を確認

## Open Issues
- Supabase Dashboard 上での表示確認は未実施
- Resend / PostHog / Stripe の env は空のままなので、該当機能の本番検証は別途設定が必要

## Next Steps
- 公開サイト上で管理者 magic link ログインが本番 URL に戻ることを実地確認する
- 必要なら Resend の sender を検証済みドメインに切り替える
