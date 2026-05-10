# 2026-05-11 00:56 — favicon 表示修正

## Summary
ブラウザ favicon とヘッダー左側のブランドアイコンに、既存の favicon 画像を表示するよう修正した。

## Background
favicon がブラウザに表示されず、ヘッダーの Memorial Items 左側も黒いプレースホルダーのままだった。

## Changes
- `app/icon.png` — Next.js App Router の icon convention 用に既存 favicon 画像を追加
- `app/layout.tsx` — metadata icons に `/icon.png` を明示
- `components/common/Nav.tsx` — ブランド左側のプレースホルダーを favicon 画像に置き換え

## Decisions
- 新規画像は作らず、既存の `app/favicon-b-48.png` と同じ画像を利用した。
- 既存の `app/favicon-b-48.png` は削除せず保持した。
- ルートやナビゲーション構造は変更しないため、画面遷移ドキュメントは更新しない。

## Validation
- `npm run typecheck` でエラーなし
- `npm run lint` でエラーなし
- `npm run test` で 6 files / 59 tests passed
- `npm run build` で `/icon.png` が static route として生成されることを確認

## Open Issues
- なし

## Next Steps
- なし
