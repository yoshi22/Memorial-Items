# 05_decisions_log.md

## Decision log purpose
このファイルは、「なぜそう設計したか」と「なぜやらなかったか」を残すためのログである。
pre-PMF では、採用理由より不採用理由の方が重要になることが多い。

---

## 2026-04-17 / Product scope
### Decision
1商品カテゴリのオーダーメイド額装アートに絞る。

### Why
商品カテゴリを増やすと、UI・価格・制作・印刷・物流・CSが同時に複雑化するため。

### Rejected alternatives
- クッションやTシャツ等を同時展開
- ペット以外への拡張
- マルチカテゴリEC化

---

## 2026-04-17 / Art generation strategy
### Decision
画像生成はアプリ内に組み込まず、外部制作ツールを使った manual-first 運用にする。

### Why
現時点で重要なのは生成自動化ではなく、品質担保された proof-to-print 運用だから。
完全自動は「似ていない」事故のリスクが高い。

### Rejected alternatives
- 顧客向けリアルタイム生成
- 自動プロンプト生成パイプライン
- 完全自動バッチ生成

---

## 2026-04-17 / Order access strategy
### Decision
顧客はログイン不要、token-based access とする。

### Why
MVP でアカウント登録を必須にすると、注文導線が重くなるため。

### Rejected alternatives
- 顧客認証必須
- 会員制ECモデル

---

## 2026-04-17 / Revision model
### Decision
標準の修正回数は2回前後を前提に設計する。

### Why
無制限修正は受注時点では魅力的に見えるが、pre-PMF では制作負荷が読めず危険。

### Rejected alternatives
- 完全無制限修正
- 修正不可モデル

---

## 2026-04-30 / Phased payment rollout

### Decision
Phase 1 は銀行振込のみで開始する。環境変数の有無で決済手段を動的に制御し、Phase 2 で PayPay、Phase 3 でクレジットカードを env 追加のみで有効化できる設計とする。

### Why
Stripe の website verification 審査が長期化しており、外部決済プロバイダ依存ゼロで先に運用検証を始めるため。振込のみでも高単価・オーダーメイドサービスでは一般的。

### Rejected alternatives
- Phase 0 で Stripe + PayPay を同時公開（審査待ちで公開できない）
- 決済方法を boolean フラグで制御（env の有無で十分。専用フラグは不要な複雑さ）
- 動的 zod スキーマ（複雑度に対する利得が低い）

### Supersedes
2026-04-17 / Payment model（複数の外部決済導線同時提示）の方針を振込先行に変更。

---

## 2026-05-01 / Enable PayPay (Phase 2)

### Decision
Phase 2 として PayPay を追加する。当面は PayPay 送金 URL またはマイコード QR を使い、加盟店化は需要が見えてから判断する。

### Why
振込のみだと PayPay ユーザー（特に若年層）を取りこぼす可能性がある。PayPay は URL 1 本または QR 画像 URL で即日導入でき、追加コストが低い。Phase 1 の env-driven 設計のおかげでコード変更なし（env 追加のみ）。

### Rejected alternatives
- PayPay for Business 加盟店化から始める（审查 1〜2 週間かかり、Stripe と同様の遅延が発生する）
- Phase 2 を skip して Stripe 復活を待つ（PayPay ユーザーを取りこぼす・Stripe 審査期間が読めない）

---

## 2026-05-01 / Roll back PayPay activation, keep code

### Decision
PayPay 決済（Phase 2）の本番有効化を見送り、運用は銀行振込のみとする。コード・テスト・runbook は温存し、Vercel に env を追加すれば即時再開できる状態を保つ。また `paymentMethods` と privacy policy の第三者提供リストを env-driven 化し、env の有無で公開表示が自動同期するよう修正した。

### Why
振込のみで初期注文を回し、運用負荷と顧客行動を観察してから決済導線を増やす方が pre-PMF として学習効率が高い。個人版 PayPay（マイコード / 送金 URL）の継続事業利用は規約違反リスクがあり、本格運用には PayPay for Business 加盟店申請（審査 1〜2 週間）が必要なため、Stripe と同じ「審査待ち」が発生してしまう。

### Rejected alternatives
- PayPay コードを削除（再開時のコストが高く、env-driven 設計の利点を捨てることになる）
- 公開 claim はそのまま・env 未設定で運用（顧客に「PayPay 受付中」と誤情報を出してしまう）

### Supersedes
2026-05-01 / Enable PayPay (Phase 2) の方針を「実装は維持・有効化は保留」に変更。Phase 2 の設計決定自体は無効化しない。

---

## 2026-04-17 / Payment model
### Decision
複数の外部決済導線を提示し、支払い確認は内部で手動管理する。

### Why
フル統合決済を急いでも、pre-PMF では実装負荷に対する学びが薄い。
一方で、顧客がどの支払い手段を好むかは確認したいため、クレジットカードや PayPay QR など複数の外部導線を提示できるようにする。

### Rejected alternatives
- 複雑な checkout 実装
- 自動返金ワークフロー
- 単一の Payment Link のみで固定

---

## 2026-04-18 / Physical shipping deferred to future feature
### Decision
MVP テスト段階では物理額装・配送を無効化し、「注文 → proof 確認 → 承認 → 完成画像ダウンロード」で完結させる。
`ENABLE_PHYSICAL_SHIPPING` フラグ（default `false`）で将来復活可能にする。

### Why
pre-PMF では「顧客が画像納品に対価を払うか」の検証が最優先。
物理配送の実装は完全だが、運用負荷（印刷・額装・発送）を伴うため、画像価値検証を先行させる。

### Rejected alternatives
- 物理配送コードを完全削除（将来復活コストが上がるため不採用）
- 物理配送のままテスト（検証対象が曖昧になるため不採用）

---

## 2026-04-17 / Documentation policy
### Decision
`current_release.md` には MVP の範囲しか書かない。

### Why
将来構想を混ぜると、Claude Code が不要な構造を作りやすくなるため。

### Rejected alternatives
- roadmap と current release の混在
- 将来拡張前提の spec 記述

---

## 2026-05-03 / Digital-first MVP product

### Decision
MVP の主商品はデジタル納品の画像のみとする。物理商品（キャンバス・アクリル等）は将来検討。

### Why
在庫・発送コストゼロで作例・修正フロー・世界観の価値を最速で検証できるため。
物理商品アップセルの入口として活用できる。

### Rejected alternatives
- 最初からキャンバスや額装を主力にする
- デジタルと物理を同時投入する

---

## 2026-05-03 / Cap revisions at 2

### Decision
修正は最大 2 回までを標準とする。

### Why
無制限修正は採算崩壊と納期肥大を招く。0 回は顧客信頼を損ねる。
proof 品質と作業時間上限のバランス点として 2 回が妥当。

### Rejected alternatives
- 修正無制限（標準化）
- 修正 1 回
- proof なし即納品

### Note
2026-04-17 / Revision model（2 回前後を前提とした設計）を確定として補強するエントリ。

---

## 2026-05-03 / Strategy memo lives in current_release as non-binding

### Decision
ポジショニング・製品ポートフォリオ・展開順・プラットフォーム戦略などの将来構想は
`docs/specs/current_release.md` 末尾の `## Future ideas` に「備忘録」として置く。
新規 strategy doc は作らない。memo 内容は commitment ではなく、変更しても ADR 追記は不要。

### Why
pre-PMF で commitment 化された roadmap は誤解を生む。
docs を増やさず散逸も防ぐ折衷点として current_release 末尾の memo セクションが適切。

### Rejected alternatives
- 新規 `00_strategy.md` 等の作成
- 将来構想を ADR として確定扱いにする
- current_release.md を全面的にプロダクト方針の主ソースとして再設計する
