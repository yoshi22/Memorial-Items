# current_release.md

## Release objective
最初の有料注文を受け、注文〜初稿確認〜修正〜承認〜完成画像納品の一連の流れを実運用で成立させる。
物理額装・配送は将来機能（`ENABLE_PHYSICAL_SHIPPING=true` で有効化）。

## In scope

### Customer-facing
- LP
- examples page
- FAQ page
- order form
- order submitted confirmation
- token-based order detail page
- token-based proof review page
  - approve
  - request revision
- payment method display（Phase 1: 銀行振込。Phase 2: PayPay 実装済み・保留中。Phase 3 以降でクレジットカードを追加）

### Admin-facing
- admin login
- orders list
- order detail
- status update
- uploaded customer image review
- proof upload
- revision history view
- payment status manual update
- FAQ/examples content update
- ※ print master upload / tracking number update は `ENABLE_PHYSICAL_SHIPPING=true` 時のみ

### System
- order record creation
- image upload and storage
- proof versioning
- revision request persistence
- email notifications
- payment method announcement（Phase 1: 銀行振込案内。Phase 2: PayPay 案内・実装済み・保留中。Phase 3 以降でクレジットカードを追加）
- minimal analytics events

## Out of scope
- customer accounts
- customer dashboard beyond token access
- real-time image generation
- self-editing
- unlimited product types
- advanced payment automation
- refunds workflow
- reviews
- coupons / referrals
- B2B / wholesale features
- mobile app

## Acceptance criteria

### Order flow
- 顧客が注文フォームを完了できる
- 写真アップロードが成功する
- 顧客が有効な支払い方法を選択できる（Phase 1: 銀行振込。Phase 2: PayPay は実装済み・保留中）
- 管理者が注文詳細を確認できる

### Proof flow
- 管理者が proof をアップロードできる
- 顧客が proof を閲覧できる
- 顧客が承認または修正依頼を送れる
- 修正履歴が保存される

### Digital delivery flow
- 顧客が承認後、注文詳細ページ（/o/[token]）から完成画像をダウンロードできる
- 承認完了メールにダウンロードページへの案内が含まれる
- 顧客が選択した支払い方法に応じた支払い案内が表示される（Phase 1: 振込先口座情報。Phase 2: PayPay QR / リンク・実装済み・保留中）
- 管理者が支払い状態を更新できる

### Fulfillment flow（ENABLE_PHYSICAL_SHIPPING=true 時のみ）
- print master をアップロードできる
- proof と print master が区別される
- 管理者が追跡番号を登録できる
- 顧客へ発送通知が送られる

## Non-functional requirements
- 管理画面は認証で保護される
- customer uploads / proofs / print masters は public にしない
- 主要フォームはバリデーションされる
- 主要導線はエラー時に分かりやすいメッセージを出す

## Note
このドキュメントは current release 専用であり、将来拡張や roadmap は記述しない。
末尾の `## Future ideas` セクションは確定方針でなく備忘録であり、commitment ではない。

---

## Future ideas (memo, not a commitment)

このセクションは確定方針ではなく、検討中の案を散逸させないための備忘録。
実装やロードマップの commitment ではない。判断を変える場合も ADR 化は不要。
詳細な確定判断は `docs/05_decisions_log.md` を参照。

### Positioning（案）

市場には大きく 3 タイプのプレイヤーが存在する:
- **A: 低価格・量産・多 SKU 型**: 製造基盤が強み。正面衝突すると不利
- **B: アート訴求・中価格帯型**: アート感・修正対応・LP 訴求が強み
- **C: 高タッチ・メモリアル特化型**: 供養・記念文脈への深い適合が強み

狙いポジション（案）: B と C の中間。温かい絵柄・人が最終調整する安心感・メモリアルに耐える品質・中価格帯。低価格量産との正面衝突はしない。

### Product portfolio（案）

- MVP の主商品: デジタル納品の画像のみ
- 修正は最大 2 回が標準
- AI は裏側で使ってもよいが、表では主役にしない
- 「AI 不使用」など虚偽表現は絶対にしない

### Expansion order（案）

| 優先度 | 商品 | 備考 |
|-------|------|------|
| 高 | デジタル画像 | MVP 主商品。入口として有効 |
| 高 | キャンバス / アートパネル | 外注しやすく粗利率高め |
| 高 | アクリルパネル | 記念品・ギフト適性あり |
| 中 | クッション | 原価重め。主力化は慎重に |
| 低 | 額装品 | 梱包・破損・運用重い。初期はやらない |
| 低 | 多 SKU 展開 | 現時点では不要 |

### Unit economics（仮説 / Hypothesis, unvalidated）

| 商品 | 想定価格（税込） | 想定外注原価 | コメント |
|------|--------------|-----------|--------|
| デジタル画像 | ¥4,980 前後 | ¥0 | 実質コストは作業時間 |
| キャンバス | ¥8,980 前後 | ¥1,400 前後 | 粗利率高め。有望 |
| アクリル | 未定 | 未定 | キャンバスに近い想定 |
| クッション | ¥9,800 前後 | ¥4,000〜 | 利益率に注意 |

> すべて仮置き・未検証。外注先の選定・ロット・送料で変動する。

### Platform strategy（案）

- **初期**: minne 等マーケットプレイス併用（流入・レビュー獲得）
- **中期**: minne + 自社サイト並走。minne = 新規獲得、自社サイト = ブランド説明・修正フロー・将来アップセル
- **長期**: 自社サイト主軸。minne は新規獲得チャネルの一つとして残す

minne からの露骨な外部誘導はしない。ブランド名・SNS 統一・指名検索によって自然流入を作る。

### Operational model（案）

自社で持つオペレーション: 画像制作・初稿提示・修正対応・最終承認・発注管理

外注候補: 物理商品の製造・梱包・直送（オリジナルプリント.jp、Me-Q 等の POD/OEM）

### Things to avoid（案）

- 最初から多 SKU 展開
- 初期に額装など運用重い商品
- 「安い・修正多い・商品数多い」を同時にやる
- AI を主役に見せる
- 低価格量産プラットフォームと正面衝突
- マーケットプレイスだけに永続依存
- 修正無制限を標準にする
