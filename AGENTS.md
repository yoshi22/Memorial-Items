# AGENTS.md

このファイルは **Codex CLI / OpenAI Codex エージェント** がこのリポジトリで作業する際の指示書です。
Codex はこのファイルを自動で読み込みます。プロジェクトルートで作業するエージェントは、作業開始前に本ファイルを必ず参照してください。

> 補足: Claude Code 向けの指示は `CLAUDE.md`、細分化ルールは `.claude/rules/` 配下にあります。内容が競合した場合は、本ファイルと `CLAUDE.md` の「Hard constraints」を最優先してください。

---

## 1. プロジェクト概要

Pet custom framed-art サービスの **pre-PMF MVP** です。
顧客がペット写真をアップロード → スタイル/サイズ/額を選択 → proof を確認 → 修正依頼 or 承認 → 物理プロダクトを発送、という導線を支えます。

このリポジトリは以下の検証を目的とします:
1. likeness(似ている度)への課金意欲
2. proof & 修正プロセスへの信頼
3. すぐ飾れる物理アウトプットの価値

**汎用AI画像生成プラットフォームではありません。**

---

## 2. 技術スタック

- Next.js (App Router) + TypeScript
- Supabase (Auth / Database / Storage)
- Tailwind CSS v4 + shadcn/ui ベース
- Vitest + Testing Library
- PostHog (最小ファネル計測)
- Resend (メール送信)

主要 npm scripts:

```bash
npm run dev          # 開発サーバ (Next.js)
npm run build        # 本番ビルド
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run test         # Vitest (単回)
npm run test:watch   # Vitest (watch)
```

---

## 3. ディレクトリ構成(重要部分のみ)

```
app/          # Next.js App Router ページ・Route Handler
components/   # UI コンポーネント (shadcn/ui ベース)
lib/          # ドメインロジック / Supabase クライアント等
supabase/     # migration / seed
tests/        # Vitest テスト
docs/         # プロダクト・設計・運用ドキュメント
  specs/current_release.md       # MVP スコープの唯一の正
  05_decisions_log.md            # 設計判断の記録
  08_art_production.md           # アート制作ワークフロー
  09_screen_transitions.md       # 画面遷移図
  development-log/               # 変更ごとの開発ログ
  runbooks/                      # 運用手順
.claude/rules/                   # 領域別ルール(backend/frontend/security/...)
```

---

## 4. 作業開始前に必ず読むもの

1. `docs/specs/current_release.md` — **MVP スコープの唯一の正**
2. 該当領域のルール (`.claude/rules/backend.md` / `frontend.md` / `security.md` / `art-production.md` / `testing.md` / `analytics.md`)
3. 変更対象に近い `docs/` 配下のドキュメント
4. 関連する `docs/development-log/` の直近エントリ

スコープ外と判断したら、**実装前に** `docs/05_decisions_log.md` への追記可否を人間に確認してください。

---

## 5. Codex CLI 向け特記事項 (落とし穴と対処)

Codex は「プロジェクト全体を見て最短で完成形に近づける」傾向があります。このリポジトリは manual-first / pre-PMF のため、以下を厳守してください。

### 5.1 指示していない箇所は触らない
- リファクタ・命名変更・「改善した方がよさそうな箇所」の修正を **勝手に行わない**。
- 既存の振る舞いは原則変えない。変える場合は理由を Pull Request / コミットメッセージに明示する。
- 変更対象ファイルのみに編集を限定する。周辺ファイルは読み取りはしてよいが、自主判断で書き換えない。
- 例外: 型エラー・ビルドエラーを解消するために必要な最小修正のみ許可。

### 5.2 テストは「通るもの」ではなく「仕様を守るもの」
- テストを書く前に、守りたい振る舞いと失敗させたいケース(不正入力・権限なし・制限超過など)を列挙する。
- 現在の実装が通るテストだけを書くことを **禁止** する。仕様側の期待値から逆算する。
- 優先度は `.claude/rules/testing.md` の Priority test areas に従う(注文フォーム validation / 画像アップロード / order status 遷移 / proof 承認・修正 / token access / admin auth)。
- snapshot test の乱用禁止、flaky を残さない。

### 5.3 作業途中のコードを消さない (最重要)
Codex は「ゴールへの最短経路」を取りがちで、WIP のコードを削除してしまうことがあります。これは人間の作業成果を破壊します。

厳守事項:
- **ファイル削除は禁止**。削除が必要と思える場合は、人間に確認してから行う。
- **コメントアウトされたコード、`// TODO:` / `// FIXME:` / `// WIP:` は保持する**。整理・削除しない。
- **未使用に見える import / 関数 / コンポーネント** でも自動削除しない(途中実装である可能性がある)。
- `git status` で未コミットの変更がある場合、まず差分を読んでから関連領域を編集する。
- 既存ファイルの全面書き換え(Write で上書き)より、差分編集(Edit)を優先する。
- "temporary" コメントがついた緩い実装も、勝手に本実装へ置換しない(セキュリティ観点で残っている場合がある)。

### 5.4 不要な抽象化を入れない
- service layer / repository pattern / workflow engine / queue / event bus は **今は導入しない**。
- multi-tenant・marketplace・汎用 catalog を前提にした設計を混ぜない。
- 3つ以上類似コードが並んでから共通化を検討する(DRY より YAGNI)。

### 5.5 破壊的操作は事前確認
以下は必ず人間の承認を得てから実行する:
- `git reset --hard` / `git push --force` / ブランチ削除
- Supabase migration の apply / schema の破壊的変更
- `node_modules` 削除以外の lockfile 系操作
- 本番環境変数を触る操作
- `supabase/` 配下の既存 migration の改変(新規追加は可)

---

## 6. 実装ルール(要約)

詳細は `.claude/rules/` を参照。要点のみ:

### Backend
- Route Handlers / Server Actions を基本とする。
- order status は enum 値で明示管理。
- proof / revision / print master は別概念。storage path 規則を固定して混ぜない。
- 顧客アクセスは署名トークン or 推測困難な public token、admin は認証必須。

### Frontend
- 1画面1責務。派手なアニメーション・独自コンポーネント乱造禁止。
- proof ページでは「承認」「修正依頼」を大きく明確に分ける。
- "AI生成中" のような内部概念を顧客に見せない。

### Security
- raw uploads / proofs / print masters を public bucket に置かない。
- upload 時に MIME / size を検証。
- secrets をリポジトリに書かない。詳細エラーを顧客に露出しない。

### Art production
- スタイル固定3種以内。proof と print master を分離。版管理必須。
- 顧客承認前に印刷しない。人間QA必須。

### Analytics
- `.claude/rules/analytics.md` の Required events のみ。PII / 備考欄テキストを送らない。

---

## 7. ドキュメント規律(必須)

コード or 設定を変更した場合は **必ず** 以下を更新してください。フックでブロックされます。

### 7.1 development-log
- 場所: `docs/development-log/`
- 命名: `YYYY-MM-DD_HHMM_<short-title>.md`
- テンプレート: `docs/development-log/_template.md`
- 7つの見出し(Summary / Background / Changes / Decisions / Validation / Open Issues / Next Steps)をすべて埋める。
- 変更なしセッションで回避したい場合のみ `.claude/state/code_changes.json` を削除。

### 7.2 画面遷移ドキュメント
- ルート・ナビゲーション・メール内リンクを変更したら `docs/09_screen_transitions.md` を更新。
- mermaid flowchart と route table を実態に揃える。
- 変更なしセッションで回避したい場合のみ `.claude/state/route_changes.json` を削除。

### 7.3 その他の連動更新
- DB schema 変更 → `supabase/` に migration 追加
- 顧客/管理フロー変更 → 関連 `docs/`
- analytics 関連 → event mapping
- アート工程 → `docs/08_art_production.md` / `docs/runbooks/art_workflow.md`

---

## 8. Definition of Done

変更が "done" と言える条件:

- [ ] MVP スコープ内である
- [ ] `npm run typecheck` が通る
- [ ] `npm run lint` が通る
- [ ] `npm run test` の critical path が通る
- [ ] 関連ドキュメントを更新した(development-log / screen_transitions 含む)
- [ ] 実装がアプリを **より抽象的にではなく、よりシンプルに** している
- [ ] 作業途中のコードを不用意に削除していない

---

## 9. トレードオフ時の優先順位

1. Customer trust
2. Operational clarity
3. Delivery speed
4. Code elegance
5. Future extensibility

迷ったら上を優先。

---

## 10. やってはいけないこと(サマリ)

- MVP スコープ外の機能を、docs 更新なしで実装する
- 顧客向けリアルタイム AI 画像生成を入れる
- アプリ内部に AI 生成パイプラインを構築する
- multi-tenant / B2B2C / marketplace を見越した抽象化
- customer account 前提の UI を混ぜる
- 作業途中コードの削除、コメント/TODOの整理
- 指示範囲外のリファクタ
- 成功ケースだけのテスト追加
- public bucket に print master / proof を置く
- secrets のコミット
- 「改善した方がよさそう」という善意で既存挙動を変える

---

## 11. エージェント向け作業テンプレート

タスクを受け取ったら、以下の手順で進めてください:

1. 本ファイルと `CLAUDE.md` を確認
2. `docs/specs/current_release.md` でスコープ確認
3. 関連する `.claude/rules/*.md` を確認
4. 変更対象ファイルと周辺の直近 development-log を確認
5. 未コミット変更(WIP)が無いか確認 → あれば保持する
6. 最小差分で実装
7. `npm run typecheck && npm run lint && npm run test`
8. development-log を追加、必要なら screen_transitions を更新
9. 人間に変更サマリを報告(削除・破壊的操作は事前確認)
