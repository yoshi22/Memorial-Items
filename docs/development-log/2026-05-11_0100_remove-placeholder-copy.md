# 2026-05-11 01:00 — プレースホルダー文言の整理

## Summary
問い合わせページとフォーム周辺に残っていた仮入力例・プレースホルダー的な文言を削除または実運用向けの説明文に差し替えた。

## Background
お問い合わせ時に含めてほしい情報の欄と、類似するプレースホルダー的な情報を整理したいという依頼があった。

## Changes
- `app/contact/page.tsx` — 問い合わせ時に必要な情報を用途別の実用的な案内に差し替え
- `components/order/OrderForm.tsx` — 氏名・メール・ペット名・備考の仮 placeholder を削除し、特徴欄は説明文に変更
- `components/proof/ProofReviewActions.tsx` — 修正依頼の仮入力例を説明文に変更
- 管理画面の入力欄と作例管理タグ欄から仮 placeholder を削除
- `.env.example` / `README.md` / `docs/runbooks/local_dev.md` — placeholder メールや古い例示 URL を整理
- `docs/design-brief.md` — 古いコード例に残っていた placeholder を現行方針に合わせて更新

## Decisions
- Select の「選択してください」は入力値の仮情報ではなく選択 UI の状態表示なので維持した。
- 運用手順内の具体例は、設定方法を説明するための例示として維持した。

## Validation
- `npm run typecheck` でエラーなし
- `npm run lint` でエラーなし
- `npm run test` で 6 files / 59 tests passed
- `npm run build` でエラーなし

## Open Issues
- なし

## Next Steps
- なし
