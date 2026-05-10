# 2026-05-11 00:48 — Git 管理対象からローカル情報を除外

## Summary
GitHub への初回 push 前に、ローカル状態ファイルや秘密情報を含む可能性がある env ファイルを Git 管理対象から除外した。

## Background
このディレクトリを GitHub リポジトリに紐付け、最新状態を commit / push する依頼があった。公開リポジトリに保存すべきでないキーやローカル状態はローカルのみに残す必要があった。

## Changes
- `.gitignore` — `.env` / `.env.*` を除外し、`.env.example` のみ追跡対象に維持
- `.gitignore` — `.claude/settings.local.json`、`.serena/`、`supabase/.temp/`、`.DS_Store` を除外

## Decisions
- 実値を含む可能性がある env ファイルはすべて除外し、共有用の空テンプレート `.env.example` だけを commit 対象にした。
- Supabase CLI の `.temp` と Serena のローカル設定は環境依存のため commit しない。

## Validation
- `git ls-files --others --exclude-standard` で除外対象が commit 候補から外れていることを確認
- 秘密情報らしい文字列を簡易検索し、実値ではなく env 名・ドキュメント上の placeholder のみであることを確認
- `npm run typecheck` でエラーなし
- `npm run lint` でエラーなし
- `npm run test` で 6 files / 59 tests passed

## Open Issues
- なし

## Next Steps
- なし
