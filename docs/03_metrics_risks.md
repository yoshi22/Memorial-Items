# 03_metrics_risks.md

## MVP success metrics

### Funnel metrics
- LP view
- Examples view
- Order start
- Photo upload success
- Order submit
- Proof view
- Revision request
- Proof approval
- Payment confirmed
- Order shipped
- Order completed

### Core business metrics
- 有料注文数
- 注文完了率
- 初稿提出までの時間中央値
- 初稿承認率
- 修正回数平均/中央値
- 注文から発送までの時間中央値
- キャンセル率
- 印刷差し戻し率
- 粗利率

### Trust / quality metrics
- 「似ている」評価の取得率
- 「修正しやすかった」評価の取得率
- 写真使用許諾/レビュー許諾率
- 再注文/紹介意向

## Target ranges for MVP
- 有料注文 10〜20件
- 初稿提出中央値 48時間以内
- 初稿承認率 60%以上
- 修正回数中央値 2回以内
- キャンセル率 10%未満
- 印刷差し戻し率 5%未満

## Major risks
### 1. Likeness risk
初稿が「うちの子らしくない」と判断される。
影響: 承認率低下、修正工数増大、ブランド毀損

### 2. Revision risk
修正依頼が曖昧・往復過多・反映不十分
影響: 顧客不満、制作負荷増、納期遅延

### 3. Print quality risk
色味、解像度、トリミング、素材感に問題
影響: 返品/再制作

### 4. Ops overload risk
注文数に対して制作体制が足りない
影響: SLA崩壊

### 5. Positioning risk
価格と体験の整合が取れず、安い代替に流れる
影響: CVR低下、粗利悪化

## Risk mitigations
- スタイルを固定3種以内に絞る
- 写真選定基準を明文化する
- must_keep_features を必須入力にする
- 初稿確認を必須にする
- 修正回数は標準2回に制限する
- proof と print master を分ける
- 管理画面で状態管理を明示化する

## What failure would look like
- 初稿承認まで平均3回以上修正が必要
- 制作工数が粗利を食い潰す
- 顧客が価格に納得しない
- 類似性に対する不満が繰り返し発生する
- 印刷事故や発送遅延が続く

## Decision rule
上記の失敗シグナルが一定件数を超えた場合は、開発を増やす前に以下を見直す。
1. 対象顧客
2. 商品形態
3. 価格
4. 写真ガイド
5. スタイル数
6. 修正フロー
