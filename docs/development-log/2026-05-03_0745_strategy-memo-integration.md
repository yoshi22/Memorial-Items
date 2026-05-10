# 2026-05-03 07:45 — Strategy memo integration into existing docs

## Summary
事業・製品インプット（ポジショニング、ポートフォリオ、展開順、プラットフォーム戦略、採算仮説）を新規 docs を増やさず既存 4 ファイルに統合した。確定判断は `05_decisions_log.md` に ADR として追記し、将来構想・備忘録は `current_release.md` 末尾の memo セクションに置いた。

## Background
pre-PMF MVP の E2E が通った後、次の製品判断（物理商品の追加順・価格帯・プラットフォーム選択など）の検討メモが docs に散在していなかった。新規 docs を量産せず、かつ roadmap commitment にならない形で既存 docs に統合する必要があった。

## Changes
- `docs/specs/current_release.md`: 末尾に `## Future ideas (memo, not a commitment)` セクションを追加。ポジショニング案・製品ポートフォリオ案・展開順案・Unit economics 仮説・Platform strategy 案・Operational model 案・Things to avoid を備忘録として記載
- `docs/05_decisions_log.md`: 確定判断 3 件を ADR として追記
  - `2026-05-03 / Digital-first MVP product`
  - `2026-05-03 / Cap revisions at 2`（既存 2026-04-17 / Revision model を補強）
  - `2026-05-03 / Strategy memo lives in current_release as non-binding`
- `docs/09_screen_transitions.md`: 末尾に `## Future notes（memo, not a commitment）` を追加。デジタル納品 UX 補強・物理アップセル導線・流入チャネル計測の将来案を備忘録として記載
- `docs/04_architecture.md`: `## Non-goals in architecture` の直前に `## Future model notes（memo, not a commitment）` を追加。将来の `product_type` / `price_jpy` / `customer_address` / `fulfillment_vendor` 列の追加候補を備忘録として記載
- `docs/development-log/2026-05-03_0745_strategy-memo-integration.md`: 本ファイル（今回の作業記録）

## Decisions
- **備忘録 vs ADR の書き分け**: 確定済み（digital-first、修正 2 回 cap）は ADR 化。未確定（キャンバス優先、minne 並走、ポジショニング、Unit economics）は ADR にせず `current_release.md` の memo に置く。これにより commitment の誤解を防ぐ
- **新規ファイルを作らない**: `00_strategy.md` 等の新規 docs は作らず、既存 docs の末尾 memo セクションに集約。docs 数が増えると参照負荷と陳腐化が増える
- **Documentation policy は変更しない**: `current_release.md` の既存「MVP scope only」ポリシーは維持。memo セクションは「commitment ではない」と明記することで policy と整合させた

## Validation
- `docs/specs/current_release.md` に「Hypothesis, unvalidated」「memo, not a commitment」のラベルが含まれていること
- `docs/05_decisions_log.md` の新規 ADR が確定判断のみであり、未確定の将来構想が ADR として書かれていないこと
- コード変更なし。ビルド・テストは不要

## Open Issues
- Unit economics の数値はすべて仮置き。外注先選定・ロット・送料で変動する
- minne 規約上の AI 関連表記・外部誘導制限については未確認
- アップセル導線・流入計測の具体設計は未着手

## Next Steps
なし。次の実装着手（価格表示・修正残回数表示・デジタル納品 UX 補強など）は別途判断。
