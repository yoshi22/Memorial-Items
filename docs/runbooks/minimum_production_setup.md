# minimum_production_setup.md

## Purpose
`https://memorial-items.vercel.app` を最低条件で公開し、注文受付から proof 確認までを外部テストできる状態にする。

## Done already
以下は実施済み。

- Vercel 本番 URL: `https://memorial-items.vercel.app`
- Supabase Auth
  - Site URL: `https://memorial-items.vercel.app`
  - Redirect URL: `https://memorial-items.vercel.app/auth/callback`
- `payment_method` 対応の DB マイグレーション
- 公開リンクでのアップロード画像非表示
- 注文 / 修正依頼 / 承認 / 入金確認の通知メール実装

## Remaining blockers
最低条件を満たすうえで、まだ実値が必要なのは次。

- `BREVO_API_KEY`
- 振込先口座情報 6 項目（`BANK_TRANSFER_*`）

Stripe は Phase 3 で追加する。PayPay は Phase 2 で任意追加できる（コード変更不要）。

## Minimum criteria
次を満たせば、最低条件クリアとみなす。

1. 顧客が公開 URL から注文できる
2. 管理者が Basic auth + magic link + MFA でログインできる
3. 顧客と管理者に主要ステータス通知メールが届く
4. 顧客が銀行振込の振込先口座情報を確認できる

## Step 1. Brevo を用意する
### Goal
注文受付やステータス更新時のメール通知を有効にする（独自ドメインなしで任意メールアドレスへの送信が可能）。

### User action
1. `https://www.brevo.com/` で無料サインアップ（クレカ不要、300 通/日まで無料）
2. ダッシュボード → **Senders, Domains & Dedicated IPs** → **Senders** タブ → **Add a sender**
   - From name: `Memorial Items`
   - From email: 受信可能なメールアドレス（Gmail 等の個人アドレス可）
3. 入力したアドレスに確認メールが届くのでリンクをクリック
4. ダッシュボード → **SMTP & API** → **API Keys** → **Generate a new API key**
5. 発行された `xkeysib-…` を控える（再表示不可）

### Sender address
- `EMAIL_FROM=<Step 2 で登録したメールアドレス>`
- 独自ドメインを取得した際は Brevo でドメイン認証後、送信元を差し替えると到達率が向上する

## Step 2. 振込先口座情報を用意する
### Goal
注文完了画面と注文詳細ページに振込先口座情報を表示する。

### User action
銀行口座情報を手元に用意し、次の 6 項目を控える。

```text
BANK_TRANSFER_BANK_NAME=<銀行名>
BANK_TRANSFER_BRANCH_NAME=<支店名>
BANK_TRANSFER_ACCOUNT_TYPE=普通
BANK_TRANSFER_ACCOUNT_NUMBER=<口座番号>
BANK_TRANSFER_ACCOUNT_HOLDER=<口座名義（カタカナ）>
BANK_TRANSFER_REFERENCE=<振込参考文言。例: ペット名を入れてください>
```

### Notes
- 3 項目（BANK_NAME / ACCOUNT_NUMBER / ACCOUNT_HOLDER）が揃えば振込案内が有効になる
- BRANCH_NAME / ACCOUNT_TYPE / REFERENCE は任意項目
- 入金確認は admin が `payment_status` を更新して運用する
- 振込確認運用の詳細は `docs/runbooks/bank_transfer_setup.md` を参照

## Step 3. Vercel 本番環境変数を設定する
### Goal
本番環境でメール通知と振込案内を有効にする。

### User action in Dashboard
1. Vercel Dashboard を開く
2. `memorial-items` project を開く
3. `Settings` > `Environment Variables` に進む
4. 次の値を `Production` に追加する

```text
APP_BASE_URL=https://memorial-items.vercel.app
ADMIN_EMAILS=<管理者メールアドレス>
ADMIN_BASIC_AUTH_USERNAME=<Basic auth user>
ADMIN_BASIC_AUTH_PASSWORD=<Basic auth password>
SECURITY_ALERT_EMAILS=<セキュリティ通知先メール>
ADMIN_LOCKOUT_THRESHOLD=10
ADMIN_LOCKOUT_MINUTES=30
ADMIN_MAGIC_LINK_MAX_REQUESTS=5
ADMIN_MAGIC_LINK_WINDOW_MINUTES=15
EMAIL_FROM=<Brevo に登録した送信者メールアドレス>
BREVO_API_KEY=<Brevo の API key>
BANK_TRANSFER_BANK_NAME=<銀行名>
BANK_TRANSFER_BRANCH_NAME=<支店名>
BANK_TRANSFER_ACCOUNT_TYPE=普通
BANK_TRANSFER_ACCOUNT_NUMBER=<口座番号>
BANK_TRANSFER_ACCOUNT_HOLDER=<口座名義（カタカナ）>
BANK_TRANSFER_REFERENCE=<振込時の参考文言>
NEXT_PUBLIC_SUPABASE_URL=<Supabase Project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase anon key>
SUPABASE_SERVICE_ROLE_KEY=<Supabase service role key>
```

### Notes
- すでに入っている値は上書きではなく確認ベースでよい
- Stripe 系 env は Phase 3 まで設定不要
- PayPay を追加したい場合は `PAYPAY_PAYMENT_URL` または `PAYPAY_QR_IMAGE_URL` を追加するだけでよい（コード変更不要）。詳細は `docs/runbooks/paypay_setup.md` を参照

## Step 4. 再デプロイする
### User action in Dashboard
1. Vercel の `Deployments` を開く
2. 最新 deployment のメニューから `Redeploy` を実行する
3. `Use existing Build Cache` はどちらでもよい
4. `Production` に再デプロイする

### CLI alternative
CLI 認証済みなら次でもよい。

```bash
npx vercel deploy --prod --yes
```

## Step 5. 動作確認する
### Customer side
1. `https://memorial-items.vercel.app` を開く
2. `Order` から注文を送信する（payment_method は銀行振込で自動選択）
3. 注文完了画面に振込先口座情報と注意書きが表示されることを確認する
4. 顧客メールアドレスに注文受付メール（振込先情報含む）が届くことを確認する

### Admin side
1. `https://memorial-items.vercel.app/admin/login` を開く
2. Basic auth を通過し、管理者メールで magic link を送る
3. 初回は MFA 登録、2回目以降は MFA 確認を行う
4. `Orders` 一覧に新規注文が表示されることを確認する
5. proof をアップロードする
6. 顧客に proof ready メールが届くことを確認する
7. 顧客が修正依頼または承認すると、管理者メールに通知が届くことを確認する

## What I can do next
実値が共有されれば、こちらで次まで実施できる。

- Vercel env 反映
- 本番再デプロイ
- HTTP レベルの疎通確認
- ドキュメントと開発ログの更新

---

## 完了記録 — 2026-05-03

全 Minimum criteria を達成し、MVP E2E テスト（Phase 1〜5）が Pass となった。

### 本番到達までに実施した追加設定

| 項目 | 内容 |
|------|------|
| メールプロバイダ移行 | Resend → Brevo（任意アドレス宛送信のため） |
| Supabase Custom SMTP | Brevo SMTP を設定（magic link レート制限回避） |
| env.ts 修正 | `NEXT_PUBLIC_*` を静的アクセスに変更（client bundle への inline のため） |
| MFA QR コード修正 | SVG → `qrcode` ライブラリで PNG 生成（Authenticator アプリ対応） |
