# 2026-05-11 01:22 — 事業者情報のプレースホルダー文言を削除

## Summary
特商法表記に表示されていた事業者情報の差し替え指示文言を削除し、請求時開示の実運用文言へ置き換えた。

## Background
公開ページに「Stripe 再審査前に実際の事業者情報へ差し替えてください」というプレースホルダー文言が残っていた。

## Changes
- `lib/public-business.ts` — 事業者名、運営責任者、所在地、注記を請求時開示の文言へ変更
- `docs/runbooks/stripe_website_recheck.md` — placeholder / 実値差し替え指示を削除
- `docs/test/README.md` / `docs/test/stripe_website_verification_checklist.md` — 再審査前という表現を公開情報確認の表現へ変更

## Decisions
- 実際の事業者名、責任者、所在地は今回入力せず、請求があった場合に遅滞なく開示する表記にした。
- 過去の development-log は履歴として変更しなかった。

## Validation
- `npm run typecheck` でエラーなし
- `npm run lint` でエラーなし
- `npm run test` で 6 files / 59 tests passed
- `npm run build` でエラーなし

## Open Issues
- なし

## Next Steps
- なし
