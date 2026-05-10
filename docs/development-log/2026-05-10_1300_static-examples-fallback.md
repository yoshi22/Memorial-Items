# 2026-05-10 13:00 — 作例の静的ファイルフォールバック実装

## Summary
管理画面を使わずに作例画像を表示できるよう、静的設定ファイルによるフォールバック機能を追加した。

## Background
作例画像を管理画面（Supabase）経由ではなく、ディレクトリにファイルを置くだけで表示したいという要件。将来的に管理画面も使う可能性があるため、DBが空の場合のみ静的データを使うフォールバック方式を採用。

## Changes
- `lib/static-examples.ts` 新規作成 — 静的作例データの設定ファイル
- `public/examples/` ディレクトリ作成 — 画像配置先
- `app/page.tsx` — DBが空の場合に STATIC_EXAMPLES をフォールバックとして使用
- `app/examples/page.tsx` — 同上

## Decisions
- DBに作例があればDB優先、空なら静的データを使うフォールバック方式にした。両方の可能性を残すため。
- 画像パスは `/examples/example-1.jpg` 形式（public配下）。CSPの `img-src 'self'` で許可済み。

## Validation
- `npx tsc --noEmit` でエラーなし確認済み

## Open Issues
- なし

## Next Steps
- `lib/static-examples.ts` の `image_url` と `title` を実際のファイル名・タイトルに書き換える
- 画像ファイルを `public/examples/` に配置する
- Vercelにデプロイして反映する
