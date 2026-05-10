# order_ops.md

## Purpose
受注ごとの日次運用手順。

## Daily routine
1. 新規注文確認
2. 写真/入力内容の確認
3. 不備連絡または制作開始
4. 初稿予定日の記録
5. proof 提示後の返答確認
6. 承認案件の印刷手配
7. 発送案件の追跡番号登録

## Step-by-step

### New order check
- status = new の注文を確認
- customer_email が入っているか
- 写真枚数が足りるか
- must_keep_features が空なら notes を確認

### If photo quality is insufficient
- 24時間以内に連絡
- 何が足りないか具体的に伝える
- status は new のまままたは in_review 保留メモ

### Move to production
- 問題なければ `in_review`
- reference images を選定
- art producer に引き渡し

### Proof management
- proof をアップロード
- version を記録
- `proof_uploaded`
- 顧客へ通知

### Revision handling
- revision request の本文を確認
- 反映方針を production notes に記録
- 新 proof version 作成
- 再通知

### Approval handling
- approved を確認
- print master の保存確認
- 印刷手配

### Shipping handling
- tracking number 登録
- shipped 通知
- 配送完了後 completed

## SLA reminders
- 注文確認: 24h
- 初稿提示: 48h
- 修正返却: 72h
- 承認後の印刷手配: 24h

## Escalation
以下の場合はその日のうちに admin note を残す。
- 類似性に強いクレーム
- 納期遅延
- 印刷不具合
- 再制作判断
