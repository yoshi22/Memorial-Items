# 2026-04-30 12:00 — Phase 1: 銀行振込のみで決済を開始

## Summary
決済方法を「Phase 1: 銀行振込のみ → Phase 2: PayPay → Phase 3: クレカ」の段階展開に方針変更した。env の有無で有効な決済手段を動的に切り替える仕組みを実装し、Phase 2/3 への移行はコード変更ゼロ・env 追加のみで完結できる設計にした。あわせて analytics バグ（`payment_marked_paid` が全 payment_status 変更時に発火していた）を修正した。

## Background
Stripe の website verification 審査が長期化しており、外部決済プロバイダ依存ゼロで先に運用検証を始める必要があった。高単価・オーダーメイドサービスでは銀行振込先行は一般的であり、MVP として有効な判断。

## Changes

### 新規ファイル
- `lib/payments.ts` — 有効な決済手段を動的判定するヘルパー関数群
- `components/order/BankTransferNotice.tsx` — 振込案内共通コンポーネント
- `supabase/migrations/20260429_add_bank_transfer_payment_method.sql` — `bank_transfer` enum 追加
- `tests/lib/payments.test.ts` — payments ヘルパーの 20 テスト
- `docs/runbooks/bank_transfer_setup.md` — 振込先設定・入金確認運用 runbook

### 変更ファイル（コード）
- `lib/supabase/types.ts` — `PaymentMethod` に `bank_transfer` 追加
- `lib/variants.ts` — `PaymentMethodId` と `PAYMENT_METHOD_LABELS` に `bank_transfer` 追加
- `lib/schemas/order.ts` — zod enum に `bank_transfer` 追加
- `lib/env.ts` — `bankTransfer*` 6 項目追加
- `.env.example` — `BANK_TRANSFER_*` 6 項目追加
- `lib/email.ts` — `getPaymentInstructionsText` に `bank_transfer` 分岐追加
- `lib/public-business.ts` — `paymentMethods: ['銀行振込']`、`paymentTiming` を振込フローに更新
- `components/order/OrderForm.tsx` — `enabledMethods` / `bankAccount` props 追加、単一決済時は Select 非描画
- `app/order/page.tsx` — `getEnabledPaymentMethods()` / `getBankTransferAccount()` を props として渡す
- `app/order/actions.ts` — `getEnabledPaymentMethodIds()` でサーバー側追加検証
- `app/order/submitted/[token]/page.tsx` — `bank_transfer` 分岐と `unknown` フォールバック追加
- `app/o/[token]/page.tsx` — 同上
- `app/admin/orders/[id]/actions.ts` — `payment_marked_paid` を `paid` 遷移時のみ発火するよう修正
- `app/legal/privacy/page.tsx` — 第三者提供から `Stripe` を削除（Phase 3 で復活）
- `tests/schemas/order.test.ts` — `bank_transfer` 起点に更新

### 変更ファイル（docs）
- `docs/specs/current_release.md`
- `docs/04_architecture.md`
- `docs/05_decisions_log.md` — 新エントリ追加
- `docs/09_screen_transitions.md`
- `docs/test/mvp_e2e_checklist.md`
- `docs/runbooks/minimum_production_setup.md` — Step 2/3 を振込先設定に置換
- `docs/test/payment_setup_walkthrough.md` — Part 0（振込）追加、Part 1/2 を凍結注記付きで残置
- `README.md`
- `docs/runbooks/vercel_deploy.md`
- `docs/test/README.md`
- `docs/runbooks/local_dev.md`
- `docs/runbooks/security_ops.md`
- `docs/test/security_acceptance_checklist.md` — 振込先情報露出確認項目追加
- `docs/runbooks/stripe_website_recheck.md` — Phase 3 凍結注記追加
- `docs/test/stripe_website_verification_checklist.md` — 同上

## Decisions

- **env の有無で feature flag**: `BANK_TRANSFER_BANK_NAME` / `ACCOUNT_NUMBER` / `ACCOUNT_HOLDER` が揃えば有効。boolean フラグは不要な複雑さ。
- **動的 zod スキーマは不採用**: 複雑度に対する利得が低い。zod の enum は全 Phase の値を保持し、server action でサーバー側に `getEnabledPaymentMethodIds()` で追加検証。
- **振込確認 UI は作らない**: 既存の `payment_status` 手動更新フロー（`AdminOrderActions.tsx`）をそのまま流用。
- **`BankTransferNotice` のみ共通化**: Stripe / PayPay の案内は引き続き inline 表示。複雑な抽象は不要。
- **`unknown` レコードは変換しない**: DB の既存 `unknown` 値は残置。表示時は `getPaymentMethodLabel()` で `'不明'` と表示される。
- **`EnabledPaymentMethodId = Exclude<PaymentMethodId, 'unknown'>`**: フォーム送信値として `unknown` が使われないよう型レベルで保証。
- **`lib/payments.ts` は `lib/env.ts` を import しない**: `lib/env.ts` はモジュール評価時に env 値を固定するため、テスト時に `process.env` を書き換えても反映されない。`payments.ts` は `process.env` を直接呼んで解決。

## Validation
- `npm run typecheck`: エラーなし
- `npm run lint`: 通過
- `npm run test`: 48 tests / 5 files 全件 pass（`tests/lib/payments.test.ts` 20 件含む）
- ローカル手動確認: `BANK_TRANSFER_*` 設定時に注文フォームで銀行振込のみ表示、hidden input 送信、BankTransferNotice 表示を確認

## Open Issues
- `app/admin/orders/[id]` の注文一覧で `payment_method` 列が非表示（Phase 2 まで先送り）
- Phase 2 移行時: `lib/public-business.ts` の `paymentMethods` に `'PayPay'` を 1 行追加 + `payment_setup_walkthrough.md` の凍結注記を解除するだけで完了

## Next Steps
- Vercel Production に `BANK_TRANSFER_*` 6 項目を登録する
- Supabase で `20260429_add_bank_transfer_payment_method.sql` migration を適用する（`supabase db push`）
- 本番で 1 件テスト注文を投入し、振込案内と通知メールを実機確認する
