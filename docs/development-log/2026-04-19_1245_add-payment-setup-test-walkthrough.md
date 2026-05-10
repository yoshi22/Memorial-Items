# 2026-04-19 12:45 Add payment setup test walkthrough

## Summary
- `docs/test` 配下に、Stripe / PayPay の決済導線を設定する詳細手順書を追加
- Dashboard 上の遷移 URL、画面名、入力する env 名、再デプロイ後の確認ポイントまで記載
- 既存の E2E チェックリストと test index から辿れるように更新

## Why
- 口頭説明だけでは、どの管理画面のどこを触るかが追いにくかった
- 一時運用前提でも、担当者が迷わず設定できる粒度の手順が必要だった

## Files changed
- `docs/test/payment_setup_walkthrough.md`
- `docs/test/README.md`
- `docs/test/mvp_e2e_checklist.md`

## Validation
- ドキュメント更新のみ
- Stripe / PayPay の実値投入は未実施
