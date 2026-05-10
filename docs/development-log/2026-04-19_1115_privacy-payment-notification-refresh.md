# 2026-04-19 11:15 — privacy payment notification refresh

## Summary
顧客向け公開リンクの露出を減らし、公開注文ページでは送付画像を非表示にした。あわせて proof UI 文言を整理し、複数外部決済導線と顧客・管理者向け通知メールの流れを追加した。

## Background
MVP の実地テストで、公開リンクに依存しすぎていること、revision 提示時の UI 文言が分かりにくいこと、通知メールが不足していること、支払い方法が単一で弱いことが明らかになった。

## Changes
- `supabase/migrations/20260419_add_payment_method.sql` — `orders.payment_method` を追加
- `lib/env.ts`, `.env.example`, `README.md` — PayPay 向け env を追加
- `lib/supabase/types.ts`, `lib/variants.ts`, `lib/schemas/order.ts` — payment method 型・表示・validation を追加
- `components/order/OrderForm.tsx`, `app/order/actions.ts` — 注文時に支払い方法を保存
- `lib/email.ts`, `app/p/[token]/actions.ts`, `app/admin/orders/[id]/actions.ts` — 顧客/管理者向け通知メールを追加
- `app/order/submitted/[token]/page.tsx`, `app/o/[token]/page.tsx` — 公開画面の露出を抑え、支払い案内を表示
- `components/admin/ProofUploader.tsx`, `app/admin/(protected)/orders/[id]/page.tsx` — proof 文言を整理
- `docs/specs/current_release.md`, `docs/05_decisions_log.md`, `docs/04_architecture.md`, `docs/09_screen_transitions.md`, `docs/test/mvp_e2e_checklist.md` — 新しい体験に合わせて更新

## Decisions
- token URL 自体は維持しつつ、画面上の再露出を減らしてメール中心の導線に寄せた
- 支払いはフル統合せず、クレジットカード / PayPay QR の外部決済導線 + 手動確認に留めた
- 顧客通知だけでなく、運用上必要な管理者通知も追加した

## Validation
- 実装後に `npm run typecheck`
- 実装後に `npm run lint`
- 実装後に `npm run test`
- `supabase db push --linked --yes`
- `npx vercel deploy --prod --yes`
- Production URL: `https://memorial-items.vercel.app`

## Open Issues
- `RESEND_API_KEY` 未設定の環境では通知メールは no-op のまま
- PayPay 側は外部案内 URL / QR のみで、決済自動連携は未実装
- Vercel に `STRIPE_PAYMENT_LINK_URL` / `PAYPAY_PAYMENT_URL` / `PAYPAY_QR_IMAGE_URL` を入れない限り、支払い導線は案内文のみになる

## Next Steps
- Vercel に `PAYPAY_PAYMENT_URL` / `PAYPAY_QR_IMAGE_URL` を追加する
- `docs/test/mvp_e2e_checklist.md` に沿って 1 件通しの再検証を行う
