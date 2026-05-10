# 2026-04-18 13:00 — Add Turbopack config and Supabase image remote pattern

## Summary
`next.config.ts` に Turbopack の `root` 設定と Supabase Storage の `remotePatterns` を追加した。開発サーバーが正常に起動することを確認。

## Background
開発サーバー初回起動時に設定が必要だったため追加。Supabase Storage の画像を `next/image` で表示するには `remotePatterns` が必要。

## Changes
- `next.config.ts` — `images.remotePatterns` に `*.supabase.co` を追加、`turbopack.root` を設定

## Decisions
- `remotePatterns` のホスト名に `*.supabase.co` を使用し、プロジェクト固有のサブドメインに限定
- pathname を `/storage/v1/**` に制限し、不要なパスを公開しない

## Validation
- `npm run dev` で起動確認 → HTTP 200、317ms で Ready
- `http://localhost:3000` がトップページを正常にレンダリング

## Open Issues
- なし

## Next Steps
- なし（設定完了）
