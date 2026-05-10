# 2026-05-10 13:10 — 作例画像を public/examples/ に移動

## Summary
作例画像を `public/` 直下から `public/examples/` に移動し、`lib/static-examples.ts` のパスを更新した。

## Background
画像が `public/` 直下に配置されていたため、`public/examples/` に整理して移動。static-examples.ts の image_url をそれに合わせて修正。

## Changes
- `public/examples/memorial_pet_portrait_.png` — public/ から移動
- `public/examples/memorial_pet_watercolor_.png` — public/ から移動
- `public/examples/memorial_pet_storybook_.png` — public/ から移動
- `lib/static-examples.ts` — image_url を `/examples/` プレフィックス付きに更新

## Decisions
- ファイル名はそのまま維持し、ディレクトリのみ変更。

## Validation
- `npx tsc --noEmit` でエラーなし
- `vercel --prod` でビルド成功・デプロイ完了

## Open Issues
- なし

## Next Steps
- なし
