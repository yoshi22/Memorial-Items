# 2026-04-18 12:00 — Apply migration and seed to Supabase

## Summary
Supabase プロジェクトへのマイグレーション適用とシードデータ投入を完了した。`gen_random_bytes` 非対応エラーを修正して push に成功。

## Background
Supabase ホスト環境では `pgcrypto` の `gen_random_bytes` が `public` スキーマから参照できないケースがある。マイグレーション初回実行時にエラーが発生したため修正した。

## Changes
- **Updated** `supabase/migrations/20260417_initial_schema.sql`
  - `create extension if not exists pgcrypto;` を削除
  - `encode(gen_random_bytes(16), 'hex')` → `md5(gen_random_uuid()::text || clock_timestamp()::text)` に変更（2箇所）
- **Created** `supabase/config.toml` — Supabase CLI link に使用（前セッション）
- シードデータを Node.js スクリプト経由で直接投入（`supabase db execute` が CLI v2.67 で非対応のため）

## Decisions
- `md5(gen_random_uuid()::text || clock_timestamp()::text)` を採用: 追加拡張不要、32 文字 hex、衝突確率は実用上無視できる
- シードは CLI ではなく Supabase JS クライアント（service role）経由で投入: CLI の互換性問題を回避

## Validation
```
supabase db push → Finished supabase db push
faq_items: OK
content_examples: OK
```
Supabase Dashboard の Table Editor で orders / faq_items / content_examples 等のテーブルが作成されていることを確認。

## Open Issues
- なし

## Next Steps
- `npm run dev` でローカル動作確認
- Vercel デプロイ
