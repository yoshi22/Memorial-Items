# 2026-04-19 12:10 Document minimum production setup

## Summary
- 本番 URL `https://memorial-items.vercel.app` を最低条件で成立させるための設定手順を整理
- ユーザー操作が不可欠な外部サービス設定を、Resend / Stripe / PayPay / Vercel ごとに分離して記載
- 既存の `vercel_deploy.md` に最低条件の考え方を追記

## Why
- コード側の対応は完了している一方、通知メールと決済導線は外部サービスの実値がないと有効化できない
- この状態で「何が完了済みで、何を手動でやる必要があるか」が分かりづらかった

## Files changed
- `docs/runbooks/vercel_deploy.md`
- `docs/runbooks/minimum_production_setup.md`

## Validation
- ドキュメント更新のみ
- 実値未共有のため、追加の Vercel env 反映は未実施

## Next actions
- `RESEND_API_KEY`
- `STRIPE_PAYMENT_LINK_URL`
- `PAYPAY_PAYMENT_URL` または `PAYPAY_QR_IMAGE_URL`
  を取得後、Vercel 本番環境へ反映して再デプロイする
