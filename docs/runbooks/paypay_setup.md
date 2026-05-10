# paypay_setup.md

> **現在保留中**: PayPay 決済（Phase 2）はコード・テスト・ドキュメントとも実装済みだが、現在の運用は銀行振込のみ。
> Vercel Production に `PAYPAY_PAYMENT_URL` または `PAYPAY_QR_IMAGE_URL` を追加して再デプロイすると PayPay が即時有効化される。
> コード変更は不要。

## Purpose
PayPay 決済（Phase 2）の資産準備・env 設定・入金確認運用・トラブル対応をまとめる。

---

## 1. 資産の選択肢

PayPay で顧客に支払い案内を出すには次のいずれかを用意する。

| 選択肢 | 必要な env | コスト | 即時性 | 留意点 |
|--------|-----------|--------|--------|--------|
| **PayPay for Business 静的 QR / 決済 URL** | `PAYPAY_QR_IMAGE_URL` または `PAYPAY_PAYMENT_URL` | 月額 0 円 + 手数料 1.6〜1.98% | 加盟店审查 1〜2 週間 | **推奨**。法人・個人事業主向け正規ルート |
| **PayPay 送金リクエスト URL** | `PAYPAY_PAYMENT_URL` | 無料 | 即時 | 個人間送金前提。継続的事業利用は規約違反リスクあり |
| **マイコード QR 画像** | `PAYPAY_QR_IMAGE_URL` | 無料 | 即時 | 個人間送金前提。同上。QR 画像を公開 URL にホストする必要がある |

詳細手順は §3 を参照。**本番運用は PayPay for Business 加盟店（3-A）を推奨**。個人版（3-B）は規約リスクがあるため短期テストにとどめる。

---

## 2. 環境変数の意味

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `PAYPAY_PAYMENT_URL` | — | PayPay 送金 URL または PayPay for Business の決済 URL。顧客に「PayPay 案内を開く」ボタンとして表示される |
| `PAYPAY_QR_IMAGE_URL` | — | QR 画像の公開 URL。注文完了画面と注文詳細ページに画像として表示される |

2 項目のどちらか 1 つが設定されていれば PayPay が有効になる。両方設定した場合は QR 画像とリンクボタンが両方表示される。

---

## 3. 資産の入手と QR 画像のホスト

### 3-A. PayPay for Business 加盟店（個人事業主向け正規ルート・推奨）

個人事業主として PayPay for Business に加盟店申込をし、静的 QR コードまたは決済 URL を発行する。継続的な事業利用を想定する場合はこの経路を選ぶ。

**コスト・期間**:
- 月額 0 円
- 決済手数料 1.6〜1.98%（業種・プランによる）
- 審査期間 1〜2 週間程度

**必要書類**（個人事業主の場合）:
1. 開業届の写し（税務署受付印または e-Tax 受付通知）
2. 本人確認書類（運転免許証・マイナンバーカードなど）
3. 屋号付き銀行口座（個人名義口座でも可、屋号付きの方が審査が通りやすい）
4. 事業内容を示す Web ページ:
   - LP（`https://memorial-items.vercel.app`）
   - 特定商取引法ページ（`/legal/commerce`）— 事業者名・住所・連絡先・返金ポリシーが明記されていること
   - プライバシーポリシー（`/legal/privacy`）
5. 商品・サービス内容の説明（取扱品目、価格帯、納期）

**申込の流れ**:
1. https://paypay.ne.jp/business/ → 「加盟店申込」をクリック
2. 事業者種別で「個人事業主」を選択
3. オンラインフォームに事業情報・口座情報を入力
4. 本人確認書類・開業届をアップロード
5. PayPay 審査（1〜2 週間）
6. 承認後、PayPay for Business 管理画面で **静的 QR コード** または **決済 URL** を発行
7. 決済 URL の場合 → `PAYPAY_PAYMENT_URL` に設定
8. QR 画像の場合 → 下記の QR 画像ホスト手順で `PAYPAY_QR_IMAGE_URL` に設定

**審査落ちの主因**:
- 特商法ページ不備（事業者情報・返金条件・納期の記載漏れ）
- LP の商品説明不足
- Memorial Items は `/legal/commerce` を整備済みなので主因はクリアできる見込み

**会計上の利点**: PayPay for Business 管理画面で売上レポート CSV が取得でき、freee / マネーフォワード等にインポート可能。決済手数料は支払手数料として経費計上。

---

### 3-B. PayPay 個人版（短期テスト・規約注意）

> **注意**: PayPay マイコード・送金リクエスト URL は規約上 **個人間送金前提** の機能。継続的な事業利用は規約違反となりアカウント停止リスクがある。**本番運用には 3-A の加盟店化を推奨**。加盟店審査期間中の一時運用や少数件のテストにとどめること。

個人版 QR / URL の取得方法は PayPay 公式ヘルプを参照。QR 画像をホストする場合は次の手順を使う。

---

### QR 画像のホスト手順（3-A / 3-B 共通）

QR 画像ファイル（推奨: 512×512 px 以上の PNG）を取得したら、次のいずれかにアップロードする。

**Supabase Storage `examples` bucket（推奨）**:
1. Supabase ダッシュボードの `Storage > examples` を開く
2. `paypay-qr.png` をアップロードする
3. ファイルを右クリック → `Copy URL` でパブリック URL を取得する
4. その URL を `PAYPAY_QR_IMAGE_URL` に設定する

**外部画像ホスト**: Cloudinary など公開 URL が取得できるサービスでも代用可。

---

## 4. Vercel への登録手順

1. Vercel Dashboard を開く
2. `memorial-items` プロジェクトを開く
3. `Settings` > `Environment Variables` を開く
4. 次を `Production` に追加する

```text
PAYPAY_PAYMENT_URL=<送金/決済 URL>（任意）
PAYPAY_QR_IMAGE_URL=<QR 画像の公開 URL>（任意）
```

5. `Deployments` から最新 deployment を `Redeploy` する

再デプロイ後に `/order` を開き、注文フォームに「銀行振込」「PayPay QR」の 2 択 Select が表示されることを確認する。

---

## 5. 入金確認の運用フロー

1. 顧客が「PayPay QR」を選んで注文を送信する
2. 注文完了画面に QR 画像またはリンクと注意書きが表示される（「送金時にペット名を入れてください」）
3. 注文受付メールにも同様の案内が含まれる
4. 顧客が PayPay で送金する（メッセージ欄にペット名を記入してもらう）
5. PayPay アプリで入金を確認する
6. 管理画面 `/admin/orders/[id]` で `payment_status` を `paid` に更新する
7. `paid` 更新時に顧客へ支払い確認メールが自動送信される

---

## 6. 送金人名照合のコツ

PayPay の送金者名は PayPay の登録名（実名ではないことがある）なので、銀行振込と異なり実名照合が難しい。

代わりにメッセージ欄のペット名で照合する。注文完了画面・注文受付メール・注文詳細ページの注意書きで「送金時にペット名を入れてください」と案内している。

照合に使える情報:
- PayPay メッセージ欄のペット名
- 送金金額（注文時に案内した金額と照合）
- 送金日時（注文日から数日以内が多い）

不明な送金がある場合は、該当時期の注文リストと照合する。

---

## 7. 入金前キャンセルへの対応

注文が `new` または `in_review` の段階でキャンセルが必要な場合:

1. 管理画面で注文ステータスを `cancelled` に更新する
2. 顧客に個別メールでキャンセルを通知する（キャンセルメールは自動送信されない）
3. 入金済みの場合は PayPay アプリから返金手続きを行う（送金取消の有無は PayPay の仕様を確認する）

---

## 8. Phase 3（Stripe）への移行

Stripe website verification 通過後に実施する。
1. Stripe Payment Link 作成 → `STRIPE_PAYMENT_LINK_URL` を Vercel に追加して再デプロイ（コード変更不要。env を設定するだけで決済手段・privacy policy が自動更新される）
2. `docs/runbooks/stripe_website_recheck.md` と `docs/test/stripe_website_verification_checklist.md` の凍結注記を解除
3. development-log と decisions log にエントリ追加

---

## 9. トラブルシューティング

### PayPay が注文フォームに表示されない
- `PAYPAY_PAYMENT_URL` または `PAYPAY_QR_IMAGE_URL` が Production に設定されているか確認する
- 再デプロイ後に確認する

### QR 画像が表示されない
- `PAYPAY_QR_IMAGE_URL` が公開 URL になっているか確認する（認証が必要な URL では表示されない）
- 画像サイズが適切か（推奨: 512×512 px 以上）確認する

### PayPay を一時的に無効にしたい
- Vercel から `PAYPAY_PAYMENT_URL` と `PAYPAY_QR_IMAGE_URL` を両方空にして再デプロイする
- 注文フォームから PayPay の選択肢が消える（銀行振込のみに戻る）

### 送金人が特定できない
- PayPay アプリの受け取り履歴でメッセージ欄を確認する
- 対象時期の注文リストと送金金額で絞り込む
- どうしても特定できない場合は、当該送金者から連絡が来るまで保留する（返金は不要）
