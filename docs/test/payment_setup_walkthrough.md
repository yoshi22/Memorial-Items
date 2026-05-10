# payment_setup_walkthrough.md

## Purpose
`Memorial Items` の決済導線を有効化する手順をまとめる。

Phase 1（銀行振込）は有効。Phase 2（PayPay）は実装済み・保留中。Phase 3（クレジットカード）は Stripe website verification 通過後。
各 Phase の手順は下記の対応セクションを参照。

- **Part 0（Phase 1）: 銀行振込先を設定する** ← 有効
- **Part 2（Phase 2）: PayPay 導線を設定する** ← 実装済み・保留中（再開時は凍結注記を解除して進める）
- Part 1（Phase 3）: Stripe Payment Link ← Stripe website verification 通過後に再有効化
- Part 3: Vercel に env を設定する
- Part 4: 再デプロイする
- Part 5: 画面で確認する

---

## Part 0. 銀行振込先を設定する（Phase 1・現在有効）

### Goal
注文完了画面・注文詳細ページ・注文受付メールに振込先口座情報を表示する。

### 用意するもの
振込先として使う銀行口座の情報 6 項目。

### Vercel に env を設定する
1. Vercel Dashboard を開く
2. `memorial-items` プロジェクトを開く
3. `Settings` > `Environment Variables` を開く
4. 次を `Production` に追加する

```text
BANK_TRANSFER_BANK_NAME=<銀行名>
BANK_TRANSFER_BRANCH_NAME=<支店名>（任意）
BANK_TRANSFER_ACCOUNT_TYPE=普通（任意・デフォルト「普通」）
BANK_TRANSFER_ACCOUNT_NUMBER=<口座番号>
BANK_TRANSFER_ACCOUNT_HOLDER=<口座名義（カタカナ）>
BANK_TRANSFER_REFERENCE=<振込時参考文言>（任意）
```

### 確認ポイント
- `BANK_TRANSFER_BANK_NAME` / `BANK_TRANSFER_ACCOUNT_NUMBER` / `BANK_TRANSFER_ACCOUNT_HOLDER` の 3 項目が最低限必要
- 3 項目が揃えば振込案内コンポーネントが有効になる
- 再デプロイ後に `/order` から注文を送信し、完了画面に振込先が表示されることを確認する

### 振込確認の運用
- 顧客から入金があったら管理画面の `payment_status` を `paid` に更新する
- 振込人名の照合・入金前キャンセル対応は `docs/runbooks/bank_transfer_setup.md` を参照

---

## Current public app (Phase 1 context)
- App URL: `https://memorial-items.vercel.app`
- Order page: `https://memorial-items.vercel.app/order`

## Important constraints
- 現在のアプリは、決済完了を webhook で自動反映しない
- 決済自体は外部サービスへ遷移させる
- 支払い完了の内部ステータスは管理画面で `payment_status` を更新して運用する
- PayPay の QR や URL は、オンライン掲載してよい資産だけを使う

## What the app expects
アプリ側は env の有無で表示する決済手段を動的に切り替える。

Phase 1（現在）:
- `BANK_TRANSFER_BANK_NAME` + `BANK_TRANSFER_ACCOUNT_NUMBER` + `BANK_TRANSFER_ACCOUNT_HOLDER` が揃えば振込案内が有効

Phase 2 以降（追加のみ・コード変更不要）:
- `PAYPAY_PAYMENT_URL` または `PAYPAY_QR_IMAGE_URL` → PayPay 案内が追加
- `STRIPE_PAYMENT_LINK_URL` → クレジットカード案内が追加

## Part 1. Stripe Payment Link を作成する（Phase 3 用・現在凍結）

> **Phase 3 用ドキュメント**。Stripe website verification 通過後に再有効化する。Phase 1/2 では設定不要。

### Goal
顧客がクレジットカード払いに進める URL を 1 本発行する。

### Browser path
1. ブラウザで `https://dashboard.stripe.com/` を開く
2. Stripe にログインする
3. 左メニューから `Payment Links` を開く
   - URL は通常 `https://dashboard.stripe.com/payment-links` 系
4. 画面右上の `Create payment link` または `New` を押す

### What to configure
作成画面で、最低限次を設定する。

1. 商品名
   - 例: `Memorial Item Order`
2. 金額
   - テスト時に請求したい金額
3. 通貨
   - `JPY`
4. 説明
   - 例: `Pet memorial custom framed art order`
5. 画像
   - 任意

### Recommended notes
- 1 商品 1 リンクでもよい
- MVP では注文ごとの個別金額自動連携は未実装
- まずは固定金額でよい

### Save the URL
作成後、Stripe が決済 URL を発行する。これを控える。

例:

```text
https://buy.stripe.com/xxxxxxxxxxxxxx
```

この値が `STRIPE_PAYMENT_LINK_URL` になる。

## Part 2. PayPay 導線を決める（Phase 2・実装済み・保留中）

> **保留中**: 現在の運用は銀行振込のみ。PayPay を有効化する場合はこのセクションの手順を進める。
> 詳細な資産入手手順（加盟店申込・個人版の違い含む）は `docs/runbooks/paypay_setup.md` を参照。

### Goal
顧客が PayPay で支払うための案内を表示できるようにする。
`PAYPAY_PAYMENT_URL` または `PAYPAY_QR_IMAGE_URL` のいずれかを設定すれば注文フォームに PayPay が追加される。

### 資産の選択肢
詳細は `docs/runbooks/paypay_setup.md` を参照。主な選択肢は次の通り。

| 選択肢 | 必要な env | 即時性 |
|--------|-----------|--------|
| PayPay 送金リクエスト URL | `PAYPAY_PAYMENT_URL` | 即時 |
| PayPay マイコード QR 画像 URL | `PAYPAY_QR_IMAGE_URL` | 即時 |
| PayPay for Business 静的 QR | `PAYPAY_QR_IMAGE_URL` | 加盟店审查 1〜2 週間 |

### Option A: Payment URL を使う
PayPay の送金リクエスト URL または加盟店決済 URL を使う。

```text
PAYPAY_PAYMENT_URL=https://qr.paypay.ne.jp/...
```

### Option B: QR 画像を使う
公開可能な QR 画像を Supabase Storage（`examples` bucket 等）や外部 CDN にホストし、その URL を使う。

```text
PAYPAY_QR_IMAGE_URL=https://...（公開 URL）
```

### 両方設定する場合
`PAYPAY_PAYMENT_URL` と `PAYPAY_QR_IMAGE_URL` の両方を設定してもよい。QR 画像とリンクボタンが両方表示される。

### Do not do this
- 店舗用のオフライン QR をそのまま公開ページに載せない
- PayPay の規約確認なしに加盟店側で独自に QR 化しない

### 顧客への注意書き（自動表示）
PayPay を選んだ顧客には注文完了画面と注文詳細ページに次の注意書きが自動で表示される:
- 送金時のメッセージ欄にペット名を入れてください
- ご入金確認後 5〜10 営業日で初稿をご案内します

## Part 3. Vercel に env を設定する

### Goal
本番アプリ `https://memorial-items.vercel.app` で決済導線を出す。

### Browser path
1. ブラウザで `https://vercel.com/dashboard` を開く
2. Vercel にログインする
3. `memorial-items` プロジェクトを開く
4. 上部メニューの `Settings` を開く
5. 左メニューの `Environment Variables` を開く

### Phase 1: 銀行振込を設定する（現在）
1. `Add New` または `Add Variable` を押す
2. 次を `Production` に追加する

```text
BANK_TRANSFER_BANK_NAME=<銀行名>
BANK_TRANSFER_BRANCH_NAME=<支店名>
BANK_TRANSFER_ACCOUNT_TYPE=普通
BANK_TRANSFER_ACCOUNT_NUMBER=<口座番号>
BANK_TRANSFER_ACCOUNT_HOLDER=<口座名義（カタカナ）>
BANK_TRANSFER_REFERENCE=<振込時参考文言>
```

### Phase 2: PayPay を追加する（実装済み・保留中）
PayPay URL を使う場合:

```text
Name: PAYPAY_PAYMENT_URL
Value: PayPay の正式なオンライン決済 URL
Environment: Production
```

Stripe の場合:

```text
Name: STRIPE_PAYMENT_LINK_URL
Value: Stripe で発行した Payment Link
Environment: Production
```

### Existing env to keep
同じ画面で、次が入っていることも確認する。

```text
APP_BASE_URL=https://memorial-items.vercel.app
EMAIL_FROM=<Brevo に登録した送信者メールアドレス>
BREVO_API_KEY=<Brevo API key>
NEXT_PUBLIC_SUPABASE_URL=<Supabase Project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Supabase anon key>
SUPABASE_SERVICE_ROLE_KEY=<Supabase service role key>
ADMIN_EMAILS=<管理者メールアドレス>
```

## Part 4. 再デプロイする

### Browser path
1. `memorial-items` プロジェクト画面に戻る
2. 上部メニューの `Deployments` を開く
3. 一番新しい deployment を開く
4. 右上またはメニューの `Redeploy` を押す
5. `Production` へ再デプロイする

## Part 5. 画面で確認する

### Customer order page（Phase 1）
1. `https://memorial-items.vercel.app/order` を開く
2. 振込のみ設定なら Select 非表示・hidden input で銀行振込が自動選択される
3. PayPay env 設定済みなら「銀行振込」「PayPay QR」の 2 択 Select が表示される（Phase 2 再開後）

### Customer submitted page
到達 URL:

- `https://memorial-items.vercel.app/order/submitted/[token]`

確認ポイント:

- 銀行振込を選んだ場合: 振込先口座情報（銀行名・支店名・口座番号・口座名義など）が表示される
- PayPay を選んだ場合（Phase 2 再開後）: QR 画像またはリンクと注意書き 2 件（ペット名入力・入金後の制作開始）が表示される

### Customer order detail page
到達 URL:

- `https://memorial-items.vercel.app/o/[token]`

確認ポイント:

- 支払い方法が表示される
- 未払い時に決済案内が表示される
- 顧客アップロード画像は表示されない

### Admin order detail page
到達 URL:

- `https://memorial-items.vercel.app/admin/orders/[id]`

確認ポイント:

- 支払い方法が注文仕様として見える
- `payment_status` を `paid` に更新できる
- `paid` に変更したとき、顧客へ支払い確認メールが飛ぶ

## Recommended test sequence（Phase 1）
1. `BANK_TRANSFER_*` 6 項目を Vercel Production に追加する
2. 再デプロイする
3. 銀行振込で 1 件注文し、振込先情報が表示されることを確認する
4. 管理画面で `payment_status` を `paid` に更新し、支払い確認メールを確認する

Phase 2 再開時は上記に加えて:
- `PAYPAY_PAYMENT_URL` または `PAYPAY_QR_IMAGE_URL` を追加 → 再デプロイ → PayPay QR で 1 件注文して確認する

## Troubleshooting

### 振込案内が出ない
- `BANK_TRANSFER_BANK_NAME` / `BANK_TRANSFER_ACCOUNT_NUMBER` / `BANK_TRANSFER_ACCOUNT_HOLDER` の 3 項目が Production に入っているか確認する
- 再デプロイしたか確認する

### Stripe の案内が出ない（Phase 3）
- `STRIPE_PAYMENT_LINK_URL` が Production に入っているか確認する
- 再デプロイしたか確認する

### PayPay の案内が出ない
- `PAYPAY_PAYMENT_URL` または `PAYPAY_QR_IMAGE_URL` が Production に入っているか確認する
- 再デプロイしたか確認する

### 支払い完了が自動反映されない
- 現状仕様では正常
- 管理画面で `payment_status` を更新する
