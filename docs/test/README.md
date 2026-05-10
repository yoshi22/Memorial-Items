# test

## Purpose
公開環境・ローカル環境での実地検証手順をまとめる。

## Documents
- `mvp_e2e_checklist.md` - MVP の主要導線を 1 件通しで確認する手順
  - 顧客向け公開情報の制御、通知メール、銀行振込案内を含む（Phase 1 起点）
- `payment_setup_walkthrough.md` - 決済導線を段階的に設定する詳細手順
  - Part 0（Phase 1）: 振込先 env 設定、Part 2（Phase 2）: PayPay 設定（保留中）、Part 1（Phase 3）: Stripe 凍結中
- `security_acceptance_checklist.md` - 実運用開始前に管理画面セキュリティと運用 controls を確認する手順
  - Basic auth、MFA、lockout、upload restrictions、security headers、振込先情報の露出確認を含む
- `stripe_website_verification_checklist.md` - **Phase 3 用（現在凍結）** Stripe website verification 用の公開情報を確認する手順
