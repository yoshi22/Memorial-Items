# 2026-05-01 12:00 — Phase 2: PayPay 決済を追加

## Summary
Phase 1（銀行振込）の env-driven 設計を活用し、PayPay を Phase 2 として有効化した。コード変更は 5 ファイルの最小限にとどまり、UI・email・server validation・型・テストは Phase 1 ですべて完成していた。Vercel に `PAYPAY_PAYMENT_URL` または `PAYPAY_QR_IMAGE_URL` を追加して再デプロイするだけで PayPay が注文フォームに追加される。

## Background
Phase 1（銀行振込のみ）で発行した設計に沿った段階展開。振込のみだと若年層 PayPay ユーザーを取りこぼす可能性があり、PayPay は URL 1 本で即日導入できるため Phase 2 として実施した。Stripe website verification は引き続き保留中のため Phase 3（クレジットカード）は別途実施する。

## Changes

### コード変更
- `lib/public-business.ts` — `paymentMethods: ['銀行振込', 'PayPay']` に更新、`paymentTiming` を汎用化
- `app/legal/privacy/page.tsx` — 第三者提供リストに PayPay を追加
- `lib/email.ts` — `paypay_qr` ケースのメール本文を改善（QR のみ設定時の fallback バグ修正、注意書き 2 件追加）
- `app/order/submitted/[token]/page.tsx` — PayPay バナーに注意書き 2 件追加（ペット名入力・入金後の制作開始）
- `app/o/[token]/page.tsx` — 同上

### docs 変更
- `docs/test/payment_setup_walkthrough.md` — Part 2 の凍結注記を解除、Phase 2 有効化手順を拡充
- `docs/runbooks/minimum_production_setup.md` — PayPay は任意追加可能と記載
- `docs/specs/current_release.md` — Phase 1/2 の表現に更新
- `docs/runbooks/bank_transfer_setup.md` — Phase 2 節を「実装済み。paypay_setup.md 参照」に更新
- `docs/09_screen_transitions.md` — Mermaid とルート表を更新
- `README.md`、`docs/runbooks/vercel_deploy.md`、`docs/04_architecture.md` — env ラベル更新
- `docs/test/mvp_e2e_checklist.md` — PayPay テストデータを追加
- `docs/test/README.md` — payment_setup_walkthrough.md の説明更新
- `docs/05_decisions_log.md` — 新エントリ追加

### 新規ファイル
- `docs/runbooks/paypay_setup.md` — PayPay 資産選択・env 設定・入金確認運用 runbook

## Decisions

- **コード変更を最小限に絞った**: Phase 1 で OrderForm・submitted/o ページ・email・enum・server validation・型・テストがすべて完成していたため、UI の注意書き追記と `lib/public-business.ts` / privacy の 2 ファイル更新のみ
- **email の fallback バグを修正した**: `paypayQrImageUrl` のみ設定で `paypayPaymentUrl` 未設定の場合に「ご案内は準備でき次第」と誤通知していた。QR のみ設定時は「注文確認ページに表示されています」に変更
- **`PayPayNotice` コンポーネントは作らなかった**: インライン 20 行程度で `BankTransferNotice` と抽出メリットが異なる。overkill と判断
- **加盟店化は先送り**: pre-PMF では PayPay マイコード / 送金 URL で十分。需要が見えてから加盟店化を判断する

## Validation
- `npm run typecheck`: エラーなし
- `npm run test`: 48 tests / 5 files 全件 pass（新規テスト不要。Phase 1 のテスト群で `paypay_qr` は検証済み）

## Open Issues
- PayPay 加盟店化は別 Phase で検討（送金 URL / マイコード QR での運用で開始）
- Phase 3（Stripe）は website verification 通過後に実施

## Next Steps
- Vercel Production に `PAYPAY_PAYMENT_URL` または `PAYPAY_QR_IMAGE_URL` を追加する
- 再デプロイする
- 注文フォームで「銀行振込」「PayPay QR」の 2 択が表示されることを実機確認する
- PayPay で 1 件テスト注文を投入し、注文完了画面・メール・注文詳細ページの表示を確認する
