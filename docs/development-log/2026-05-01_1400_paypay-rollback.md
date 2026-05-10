# 2026-05-01 14:00 — PayPay 有効化を保留し振込のみ運用に戻す

## Summary
Phase 2 で実装した PayPay 決済の本番有効化を保留し、当面は銀行振込のみで運用する。コード・テスト・runbook は温存したまま、公開 claim（`paymentMethods` 配列・privacy policy の第三者提供リスト）を env-driven 化して顧客への誤表示を防いだ。

## Background
PayPay の本格運用には PayPay for Business 加盟店申請（審査 1〜2 週間）が必要なことが判明。個人版マイコード / 送金 URL は規約上グレーゾーンで継続事業利用には向かない。まず振込のみで初期注文の手応えを確認してから PayPay を追加する方が pre-PMF として合理的と判断した。

## Changes

### コード変更
- `lib/public-business.ts` — `paymentMethods` を静的配列から getter に変更し、`getEnabledPaymentMethods()` の戻り値を使って env 駆動で生成するよう修正
- `app/legal/privacy/page.tsx` — 第三者提供リスト（PayPay・Stripe）を env 駆動で動的生成するよう修正。PayPay / Stripe env 未設定時は表示されない

### docs 変更
- `docs/specs/current_release.md` — Phase 2 の記述を「有効」→「実装済み・保留中」に変更（4 箇所）
- `docs/test/payment_setup_walkthrough.md` — Part 2（PayPay）に凍結注記を追加、「有効」→「保留中」に統一
- `docs/test/README.md` — Part 2 の説明を「保留中」に変更
- `docs/test/mvp_e2e_checklist.md` — PayPay テスト条件に「Phase 2 再開後」の注記を追加
- `docs/runbooks/bank_transfer_setup.md` — Phase 2 説明に「現在保留中」を追記
- `docs/runbooks/vercel_deploy.md` — 「実施済み」→「実装済み・保留中」に変更
- `docs/09_screen_transitions.md` — Mermaid とルート表を「Phase 2 実装済み・保留中」に更新
- `docs/runbooks/paypay_setup.md` — 冒頭に保留中注記を追加、§1 の選択肢テーブルを加盟店推奨順に並び替え、§3 を「資産の入手と QR 画像のホスト」に拡張（3-A: 加盟店申請手順・3-B: 個人版注意書き）、§8 Phase 3 ステップを env-driven 化に合わせて更新
- `docs/05_decisions_log.md` — 新エントリ「Roll back PayPay activation, keep code」を追加

### 温存（変更なし）
- `lib/payments.ts`（`isPayPayEnabled()` など env helper）
- `lib/email.ts`（`paypay_qr` 分岐）
- `app/o/[token]/page.tsx`、`app/order/submitted/[token]/page.tsx`（PayPay 表示分岐）
- `app/order/page.tsx`（`getEnabledPaymentMethods()` 参照）
- 型・enum・schema・テスト全般

## Decisions
- **env-driven 化を採用**: `paymentMethods` を静的配列から getter に変えることで、Phase 2 再開時は env 追加のみで公開表示が自動同期する。静的巻き戻し（配列を手動で元に戻す）より変更点が少なく、一貫性が高い
- **個人版 PayPay の手順を runbook から削除**: 規約グレーゾーンの操作手順を詳述するのは適切ではないため、「公式ヘルプを参照」として加盟店申請（正規ルート）を主軸にした
- **Phase 3 ステップを env-driven に合わせて更新**: `STRIPE_PAYMENT_LINK_URL` 設定で `paymentMethods` と privacy policy が自動更新されるため、paypay_setup.md §8 の「手動追記」ステップを削除した

## Validation
- `npm run typecheck`: エラーなし
- `npm run test`: 全件 pass（getter 化しても env 未設定時は `[]` を返すため既存テストがそのまま通る）

## Open Issues
- PayPay for Business 加盟店申請は別途ユーザーが実施。審査期間中は振込のみで運用継続

## Next Steps
- 初期注文を振込のみで数件回して手応えを確認する
- PayPay for Business 加盟店申請のタイミングを判断する
- 承認後 Vercel に `PAYPAY_PAYMENT_URL` または `PAYPAY_QR_IMAGE_URL` を追加 → 再デプロイ → 注文フォームで PayPay が選べることを実機確認する
