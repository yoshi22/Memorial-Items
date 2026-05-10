# 2026-04-18 11:30 — Add supabase/config.toml and .env.local

## Summary
ローカル開発・マイグレーション適用に必要な `supabase/config.toml` と `.env.local` を追加した。

## Background
`supabase db push` の実行に `config.toml` が必要だが未存在だった。`.env.local` も `.env.example` からの雛形生成が未実施だったため合わせて作成した。

## Changes
- **Created** `supabase/config.toml` — Supabase CLI 用の最小設定（API/DB/Studio ポート、auth redirect URL）
- **Created** `.env.local` — `.env.example` からコピー。値は空のまま（ユーザーが記入）

## Decisions
- `config.toml` はローカル dev 用の最小構成のみ記述。本番設定は Vercel 環境変数で管理するため不要。
- `.env.local` は gitignore 済みのため安全にコミットなしで保持できる。

## Validation
- `supabase/config.toml` の存在確認: `ls supabase/` で確認済み
- typecheck / lint / test はすべて通過済み（この作業の前に確認）

## Open Issues
- `.env.local` の値はユーザーが Supabase Dashboard から取得して記入する必要がある

## Next Steps
- ユーザーが `.env.local` を記入後、`supabase db push` でマイグレーションを適用
