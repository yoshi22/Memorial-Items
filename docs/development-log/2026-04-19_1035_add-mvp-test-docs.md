# 2026-04-19 10:35 — add mvp test docs

## Summary
公開中アプリの MVP 実地検証を行いやすくするため、`docs/test` フォルダを新設し、1 件通しの E2E 手順を文書化した。

## Background
現状のアプリが MVP テストに十分かを判断するには、単なる画面一覧ではなく、顧客導線と管理導線をまたぐ実施手順が必要だった。

## Changes
- `docs/test/README.md` — テスト手順ドキュメントの入口を追加
- `docs/test/mvp_e2e_checklist.md` — 公開環境向けの詳細な 1 件通しテスト手順を追加

## Decisions
- `runbooks` とは分けて `docs/test` を新設した
- 手順は「操作」「期待結果」「失敗時の切り分け」を含む実施向け文書にした
- MVP 判定に必要な最低限の Go / No-Go 条件を明示した

## Validation
- `docs/runbooks/*.md` の既存トーンに合わせて構成した
- current release の acceptance criteria と照合し、主要導線を網羅した

## Open Issues
- 実際の 1 件通しテストの結果はまだ未記録
- Resend / PostHog の本番 env が未設定のため、通知・分析の実地確認は別途必要

## Next Steps
- `docs/test/mvp_e2e_checklist.md` に沿って公開環境で 1 件通しテストを実施する
- 実施結果を別の development log か検証メモに残す
