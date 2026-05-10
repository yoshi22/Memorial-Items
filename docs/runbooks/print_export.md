# print_export.md

## Purpose
印刷用マスターの書き出しルールを定義する。

## Output requirements
- 高解像度
- 印刷サイズに対応した比率
- 最終トリミング前提で破綻しない
- 余白・切れ位置を確認済み
- 承認済み proof と大きな差異がない

## Export checklist
1. 正しいサイズ比率か
2. 顔や耳が端で切れないか
3. 色味が不自然でないか
4. ノイズや破綻がないか
5. 印刷に耐える解像度か
6. ファイル名規則に従っているか

## File naming convention
`order-{id}_print-master_v{n}.png`

## Storage rule
- print masters bucket に保存
- public にしない
- proof と同一URL/同一ファイルにしない

## Final QA before handoff
- approved proof と見比べる
- 顧客の must_keep_features を再確認
- 印刷/額装パートナーへの仕様伝達確認

## Common failure cases
- proof は良いが、印刷比率で顔が切れる
- 色味が濃すぎる/浅すぎる
- 解像度不足
- 古い version を渡してしまう
