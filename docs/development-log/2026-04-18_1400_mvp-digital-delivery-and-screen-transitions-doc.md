# 2026-04-18 14:00 — MVP デジタル納品モード + 画面遷移ドキュメント整備

## Summary
MVP テスト用に物理配送をフィーチャーフラグ（`ENABLE_PHYSICAL_SHIPPING`）で無効化し、承認済み proof を完成画像として顧客がダウンロードできるフローを追加した。合わせて `docs/09_screen_transitions.md` を新設し、Stop フックで常に最新化を強制する仕組みを整備した。

## Background
pre-PMF の現時点では「顧客が画像納品に対価を払うか」の価値検証を先行させるため、物理額装・配送の実運用負荷を一時的に外したい、という判断（`docs/05_decisions_log.md` 参照）。

## Changes
- `lib/env.ts` — `enablePhysicalShipping` フラグを追加
- `.env.local` — `ENABLE_PHYSICAL_SHIPPING=false` を追記
- `lib/email.ts` — `sendProofApproved` をフラグで文言切替（デジタル納品時はDLページ案内）
- `app/admin/orders/[id]/actions.ts` — `updateTracking` / `uploadPrintMaster` をフラグでガード、VALID_STATUSES を分岐
- `components/admin/AdminOrderActions.tsx` — フラグで status 選択肢・追跡番号入力を条件表示
- `app/admin/orders/[id]/page.tsx` — Print Master セクションをフラグで条件表示、prop 追加
- `app/admin/orders/page.tsx` — status フィルタチップをフラグで絞り込み
- `components/proof/ProofReviewActions.tsx` — フラグで承認後メッセージを切替
- `app/p/[token]/page.tsx` — フラグを prop として渡す
- `app/o/[token]/page.tsx` — 承認後にダウンロードボタンを表示、発送情報をフラグで条件表示
- `docs/09_screen_transitions.md` — 新規：全画面遷移の Mermaid 図・ルート表・メールマップ
- `CLAUDE.md` — Screen-transition doc discipline セクション追加
- `.claude/hooks/track_route_changes.py` — 新規：ルート変更追跡フック
- `.claude/hooks/check_screen_transitions.py` — 新規：画面遷移ドキュメント更新チェックフック
- `.claude/settings.json` — 新フックを登録
- `.claude/settings.local.json` — 新フック実行の permission 追加
- `docs/specs/current_release.md` — リリース目標・受入条件をデジタル納品ベースに更新
- `docs/05_decisions_log.md` — ADR 追記
- `.claude/rules/analytics.md` — `order_shipped` フラグ注記追加

## Decisions
- フラグ切替方式を採用（完全削除は将来の復活コストが高いため）
- 完成画像 = 承認済み proof そのまま（admin による別途アップロード不要）
- ダウンロード導線 = 承認メール + `/o/[token]` の両方（既存 `/api/storage/...` API を転用）
- DB マイグレーション不要（enum・カラムは温存）

## Validation
- `npm run typecheck` 実行予定
- `npm run lint` 実行予定
- `ENABLE_PHYSICAL_SHIPPING=false` で dev 起動し、admin UI から追跡番号UI非表示・DLボタン表示を確認予定

## Open Issues
- `/api/storage/...` が返す signed URL は 60s で期限切れ。DL後にページを再読込すれば新しい URL を取得できるが、UX として「お早めに保存してください」の注記を追加済み

## Next Steps
- `npm run typecheck && npm run lint` で型・lint エラーがないことを確認
- dev サーバーで手動 e2e フロー確認
