# 2026-05-01 15:00 — 納期表記を「5 営業日以内」に変更

## Summary
メール本文・注文完了画面・注文詳細ページ・振込案内コンポーネント・公開ビジネス情報の納期表記を「5〜10 営業日」から「5 営業日以内」に統一変更した。

## Background
ユーザーの方針変更。「5〜10 営業日」の幅表記から「5 営業日以内」のコミットメント表記に変更したい。

## Changes
- `lib/email.ts` — 銀行振込・PayPay 各メール本文の納期注記を変更（2 箇所）
- `app/order/submitted/[token]/page.tsx` — 注文完了画面の PayPay 注意書きを変更
- `app/o/[token]/page.tsx` — 注文詳細ページの PayPay 注意書きを変更
- `components/order/BankTransferNotice.tsx` — 振込案内コンポーネントを変更
- `lib/public-business.ts` — `deliveryLeadTime` フィールドを変更

## Decisions
- メール・UI・公開情報の 5 箇所を同一の文言「ご入金確認後 5 営業日以内に初稿をご案内します」に統一した
- ルート・メールリンクの変更なし

## Validation
- `npm run typecheck`: エラーなし
- `npm run test`: 全件 pass

## Open Issues
なし

## Next Steps
- `npx vercel --prod` でデプロイして本番に反映する
