# 2026-05-01 21:30 — メールプロバイダを Resend から Brevo に切り替え

## Summary
Resend の `onboarding@resend.dev` はアカウント登録メール以外の任意アドレスに配送できないため、任意の顧客メールアドレスに注文受付メールを届けられなかった。独自ドメインなしで任意宛先送信が可能な Brevo（旧 Sendinblue）に切り替えた。

## Background
`RESEND_API_KEY` と `EMAIL_FROM=onboarding@resend.dev` を設定した状態で注文フローを実施したが、顧客側のメールアドレスに注文受付メールが届かなかった。原因は Resend の制限（共有テスト送信元からはアカウント登録メールにしか配送しない）。独自ドメイン取得の予定がないため、Gmail 等の個人アドレスを送信者として登録できる Brevo に移行することで対応した。

## Changes
- `lib/email.ts` — `sendEmail()` を `Resend` SDK → `BrevoClient` SDK（`@getbrevo/brevo`）に書き換え
- `lib/env.ts` — `resendApiKey` (`RESEND_API_KEY`) → `brevoApiKey` (`BREVO_API_KEY`) に変更、`emailFrom` のデフォルト `'onboarding@resend.dev'` を削除
- `app/legal/privacy/page.tsx` — 第三者提供リストの `'Resend'` → `'Brevo'` に変更
- `package.json` — `resend` 削除、`@getbrevo/brevo` 追加
- `.env.example` — `RESEND_API_KEY` → `BREVO_API_KEY`、`EMAIL_FROM` のデフォルト削除
- `docs/04_architecture.md` — Tech choices・env vars を Brevo に更新
- `docs/runbooks/minimum_production_setup.md` — Step 1 を Brevo 手順に書き換え
- `docs/runbooks/vercel_deploy.md` — Resend setup セクションを Brevo に更新
- `docs/runbooks/local_dev.md` — env 変数・前提を Brevo に更新
- `docs/test/mvp_e2e_checklist.md` — `RESEND_API_KEY` → `BREVO_API_KEY` に置換
- `docs/test/payment_setup_walkthrough.md` — env vars を Brevo に更新
- `docs/09_screen_transitions.md` — 変更履歴を追記

## Decisions
- Resend → Brevo への切替を選択。独自ドメインなしで任意メールアドレスへの配信が可能な唯一の現実的な選択肢
- SendGrid（無料プラン廃止）・Mailtrap（ドメイン認証必須）・無料 TLD（スパム判定リスク）は不採用
- `sendEmail()` ヘルパー関数のみを書き換え、公開 API（`sendOrderReceived` 等 9 関数）のシグネチャは無変更
- Resend のコードは完全削除。将来独自ドメインを取得した場合は Brevo のドメイン認証で対応する

## Validation
- `npm run typecheck`: エラーなし
- `npm run test`: 48 件全件 pass

## Open Issues
- 送信元が Gmail アドレスの場合、Brevo は Return-Path を自動で Brevo 側ドメインに書き換えるが、受信側でスパム判定される可能性がある。到達率が問題になった場合は独自ドメイン取得 + Brevo ドメイン認証で対処する
- 無料枠 300 通/日を超過すると配送停止になる。月次で Brevo ダッシュボードの利用量を確認する

## Next Steps
- Vercel Production env を更新する（ユーザー作業）:
  - `RESEND_API_KEY` を削除
  - `BREVO_API_KEY` = Brevo で発行した API key を追加（Sensitive）
  - `EMAIL_FROM` = Brevo に登録した送信者メールアドレスに更新
- `npx vercel --prod` で本番にデプロイする
- 任意のメールアドレスで注文を送信し、そのアドレスに注文受付メールが届くことを確認する
