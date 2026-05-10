# 2026-05-11 02:05 — favicon-b-48.png に参照を統一

## Summary
ブラウザ favicon とヘッダー左側のブランドアイコンが `favicon-b-48.png` を参照するように統一した。

## Background
favicon とヘッダーのアイコンに、既存の `favicon-b-48.png` を使いたいという依頼があった。

## Changes
- `public/favicon-b-48.png` — 既存 favicon 画像を public 配下にも追加
- `app/layout.tsx` — metadata icons を `/favicon-b-48.png` に変更し、type / size を明示
- `components/common/Nav.tsx` — ヘッダーのブランドアイコン参照を `/favicon-b-48.png` に変更

## Decisions
- 既存の `app/favicon-b-48.png` と `app/icon.png` は削除せず保持した。
- ヘッダー画像は App Router の metadata route ではなく、通常の public asset を直接参照する形にした。

## Validation
- `npm run typecheck` でエラーなし
- `npm run lint` でエラーなし
- `npm run test` で 6 files / 59 tests passed
- `npm run build` でエラーなし
- `public/favicon-b-48.png` が `app/favicon-b-48.png` と同一内容であることを SHA-256 で確認

## Open Issues
- なし

## Next Steps
- なし
