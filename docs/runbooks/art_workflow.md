# art_workflow.md

## Purpose
1件の注文に対して、proof と print master を作るまでの具体手順。

## Inputs
- order data
- uploaded photos
- must_keep_features
- style
- size
- frame
- notes

## Workflow

### 1. Intake review
- 注文内容を読む
- must_keep_features を読む
- 写真を全て確認
- 参考に使う写真を選ぶ

### 2. Reference selection
選定時の観点:
- 顔の印象が分かる
- 模様が分かる
- 目が見える
- 毛色が自然
- 構図が安定している

### 3. Style locking
- 注文された style を確認
- スタイル変更提案は原則しない
- 明らかに不適合な場合のみ顧客確認

### 4. Draft creation
- 外部ツールで初稿作成
- must_keep_features を必ず反映
- 背景/余白/色味を preset に合わせる

### 5. Internal QA
確認項目:
- likeness
- symmetry issues
- ear/nose/eye problems
- fur/mask pattern accuracy
- composition balance
- frame compatibility

### 6. Export proof
- web表示向けに書き出し
- 必要なら watermark
- proofs テーブルに version 登録
- Storage に保存

### 7. Revision cycle
- revision_requests を確認
- 何を直したかを production notes に記録
- 新 version を保存
- 旧 version は消さない

### 8. Final approval
- approved を確認
- approved proof と差分が大きくないことを確認

### 9. Export print master
- 高解像度出力
- 対応サイズに合わせた比率
- 最終トリミング確認
- print master 保存

## Hard rules
- 顧客承認前に印刷しない
- must_keep_features 未確認で制作しない
- 版管理を飛ばさない
- proof を print master 代わりに使わない
