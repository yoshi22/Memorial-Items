# 08_art_production.md

## Purpose
このドキュメントは、顧客から受け取った写真をもとに proof と print master を制作するための基準を定義する。
MVPでは画像生成AIをアプリに組み込まず、外部制作ツールを使う manual-first 運用を前提とする。

## Production principles
- likeness first
- fixed-style first
- human QA required
- proof and print master must be separated
- do not print before customer approval

## Allowed style presets
MVPでは固定3種以内に絞る。
例:
1. clean illustration
2. soft watercolor-like illustration
3. modern portrait style

各スタイルは、背景・余白・色味・線の強さ・額装相性を明文化しておく。

## Photo intake rules
顧客には3〜5枚の写真を求める。
望ましい要件:
- 顔がはっきり見える
- 目が見える
- 毛色や模様が分かる
- 正面または斜め前
- 過度なフィルターなし
- 解像度が極端に低くない

## Red flags in input photos
- 顔が小さすぎる
- 強いブレ
- 暗すぎる
- 模様が見えない
- 複数匹が重なっている
- 加工が強い

## must_keep_features
各注文で必ず確認する。
例:
- 鼻の周りの白さ
- 左耳の折れ
- 目の色
- 額の模様
- 口元の表情

初稿制作時に、この欄を未確認のまま進めてはいけない。

## Production workflow
1. 入力確認
2. reference image の選定
3. スタイル決定
4. 初稿作成
5. 内部QA
6. proof 書き出し
7. 顧客確認
8. 修正反映
9. 最終承認
10. print master 書き出し

## Internal QA checklist before sending proof
- 目の位置と印象は合っているか
- 毛色・模様は合っているか
- must_keep_features は反映されているか
- 耳・鼻・口元に破綻がないか
- 背景/余白はスタイル定義に合っているか
- 印刷前提で違和感のあるノイズがないか

## Proof rules
proof は顧客確認用データ。
- web 表示向けサイズ
- 必要に応じて watermark
- 色味は確認しやすいこと優先
- 顧客が修正点を指摘しやすいこと

## Revision rules
- 修正依頼は order/proof に紐づけて保存
- 何を変えたかを production notes に残す
- proof version は必ず increment する
- 上書きではなく履歴を残す

## Print master rules
print master は印刷用最終データ。
- 高解像度
- 印刷サイズに応じた比率
- トリミングを事前確認
- 不要な透かしなし
- 印刷時に破綻しないこと

## Final print QA
- サイズ比率が合っているか
- 余白/切れ位置が想定通りか
- 色味が不自然でないか
- 解像度が足りるか
- print master と approved proof に大きな差分がないか

## Out of scope
- fully automated generation
- customer-side editing
- dynamic style generation
- one-click print export automation
