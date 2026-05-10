# 06_ops_fulfillment.md

## Purpose
このドキュメントは、注文を受けてから発送するまでの実務フローを定義する。
MVPでは、オペレーションの明快さが顧客体験と収益性の両方を左右する。

## Roles
- Admin: 注文確認、顧客連絡、状態更新
- Art producer: 写真選定、初稿制作、修正反映、print master 作成
- Fulfillment coordinator: 印刷/額装手配、発送、追跡番号登録
※ 初期は同一人物が兼務してよい

## SLA targets
- 注文確認: 24時間以内
- 写真不備連絡: 24時間以内
- 初稿提示: 48時間以内
- 修正反映: 72時間以内
- 最終承認後の印刷手配: 24時間以内
- 追跡番号登録: 発送当日

## Workflow

### 1. Order received
- 注文レコード作成確認
- 写真アップロード確認
- 商品仕様確認
- 顧客メール送信（受付）

### 2. Intake review
- 写真が足りるか確認
- must_keep_features を確認
- 不足があれば連絡
- 問題なければ `new -> in_review`

### 3. Art production start
- 制作用写真を選定
- production notes 記入
- 外部制作ツールで初稿作成

### 4. Proof upload
- proof 画像をアップロード
- proofs レコード作成
- `proof_uploaded`
- 顧客へ proof ready 通知

### 5. Customer review
- 顧客が承認または修正依頼
- 修正依頼があれば `revision_requested`
- revision_requests に履歴保存

### 6. Revision cycle
- 修正内容確認
- 修正反映
- 新 proof version をアップロード
- 再通知

### 7. Approval
- 顧客承認後、`approved`
- print master 作成
- print master アップロード

### 8. Production and shipping
- 印刷/額装手配
- 仕上がり確認
- 発送
- 追跡番号登録
- `shipped`

### 9. Completion
- 配送完了後 `completed`
- 必要ならレビュー/写真許諾連絡

## Exception handling
### Bad photo quality
- 顧客に差し戻し
- どの写真が不足かを具体的に説明

### Likeness dispute
- must_keep_features と照合
- 修正で対応可能か判断
- 必要なら例外対応を admin note に記録

### Print issue
- 色味/解像度/トリミング異常時は再印刷判断
- 顧客には内部事情ではなく対応方針だけ伝える

### Delay
- SLA超過が見えた時点で先に連絡
- "いつ連絡するか" を遅らせない

## Ops rule
曖昧な状態を作らない。
「たぶん対応中」は禁止。
DB の status / proof version / revision status / admin notes に明示する。
