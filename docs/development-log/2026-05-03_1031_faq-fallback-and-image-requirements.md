# 2026-05-03 10:31 — FAQ fallback and image requirements

## Summary
公開FAQが未登録でも「準備中」とならないよう、現行MVP向けのFAQフォールバックを追加した。あわせて seed のFAQ文言をデジタル納品前提へ更新し、現在の公開画面で差し替えが必要な画像の要件を整理した。

## Background
公開サービス上で画像がプレースホルダーのままになっており、FAQも `faq_items` が空の場合に「FAQは準備中です。」と表示されていた。現行MVPはデジタル納品中心の運用であるため、seed に残っていた印刷・発送前提のFAQ文言も実態とずれていた。

## Changes
- `lib/public-content.ts` を新規作成し、公開FAQのフォールバック定義と取得ヘルパーを追加
- `app/faq/page.tsx` で DB FAQ が空でもフォールバックFAQを表示するよう変更
- `supabase/seed.sql` のFAQ初期データをデジタル納品MVP向けに更新
- `tests/lib/public-content.test.ts` を追加し、フォールバック表示・並び順・公開状態・支払い方法文言をテスト

## Decisions
- 公開FAQは DB 運用を残しつつ、公開安定性を優先して画面側フォールバックを持つ方式を採用
- フォールバックFAQは current release に合わせ、物理額装・発送ではなく proof 確認後のデジタル納品を明記
- 画像についてはコード側で仮画像を増やさず、必要な公開画像セットを以下で固定
  - ヒーロー代表作例 1 枚: `/` の額装モック用。3:4で成立する完成作例
  - 公開作例 3 枚以上: `/` の作例3枚と `/examples` 一覧用。正方形トリミングで成立する完成作例
  - スタイル別サムネイル 3 枚: `clean_illustration` / `soft_watercolor` / `modern_portrait` を見分けられる正方形画像

## Validation
- `npm run typecheck`
- `npm run lint`
- `npm run test`

## Open Issues
- LP の `3 STYLES` セクションは依然として縞模様プレースホルダーのままで、実画像差し込みは未実施
- `content_examples` 用の実画像アセット自体はまだ未投入のため、公開作例の差し替えは別途必要

## Next Steps
- 公開用の完成作例画像を用意し、`content_examples` に3枚以上投入する
- スタイル別サムネイル3枚を用意し、LP の `3 STYLES` セクションへ差し込む
