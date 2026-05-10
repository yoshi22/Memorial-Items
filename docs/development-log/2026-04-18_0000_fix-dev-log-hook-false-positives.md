# 2026-04-18 00:00 — Fix dev-log hook false positives and Python 3.6 compatibility

## Summary
導入直後の Stop hook が自分自身の検証 Bash コマンドをコード変更として誤検出した。Bash 追跡ロジックをリダイレクト限定に絞り、Python 3.6 非互換の API 呼び出しも修正した。

## Background
`track_code_changes.py` の Bash 追跡が「変更系キーワード（rm/mv/cp 等）を含むコマンド」を広く記録していたため、`rm .claude/state/code_changes.json` や `python3 .claude/hooks/...` を含む検証コマンドが誤ってコード変更として記録された。また `check_dev_log.py` が Python 3.6 で動作しなかった（`Path.unlink(missing_ok=True)` は 3.8 以降）。

## Changes
- **`.claude/hooks/track_code_changes.py`**
  - `MUTATION_RE` + `PATH_TOKEN_RE` を削除
  - Bash 追跡を `>> path` / `> path` パターン（`REDIRECT_RE`）に限定
  - リダイレクト先が `is_tracked()` を通過した場合のみ記録
  - `.claude/state/` を `EXCLUDED_PREFIXES` に追加（Write/Edit 追跡でも除外）
- **`.claude/hooks/check_dev_log.py`**
  - `STATE_FILE.unlink(missing_ok=True)` → `if STATE_FILE.exists(): STATE_FILE.unlink()` に変更（Python 3.6 対応）

## Decisions
- **Bash 追跡をリダイレクト限定にした理由**: `rm`/`mv` 等のキーワード検出は false positive が多く（テストコマンド・hook 実行コマンド自体に含まれる）、メリットより誤検出コストが高い。`> file` 形式なら対象パスが明確に取得でき、is_tracked() でフィルタできる。
- **`rm`/`mv` の Bash 追跡を外した理由**: これらはファイル削除・移動であり「コード変更」よりも「後片付け」に近いケースが多い。Write/Edit での追跡で十分カバーできる。

## Validation
```bash
# rm .claude/state/... → 記録されないこと
echo '{"tool_name":"Bash","tool_input":{"command":"rm .claude/state/code_changes.json"}}' \
  | python3 .claude/hooks/track_code_changes.py
# → state ファイル生成なし ✓

# > tracked-file → 記録されること
echo '{"tool_name":"Bash","tool_input":{"command":"echo x > lib/utils.ts"}}' \
  | python3 .claude/hooks/track_code_changes.py
# → .claude/state/code_changes.json に lib/utils.ts が記録される ✓

# checker: 未更新状態で exit 2
python3 .claude/hooks/check_dev_log.py; echo $?  # → 2 ✓

# dev log touch 後に exit 0 かつ state クリア
touch docs/development-log/...md
python3 .claude/hooks/check_dev_log.py; echo $?  # → 0 ✓
test -f .claude/state/code_changes.json  # → 不在 ✓
```

## Open Issues
- Bash リダイレクト検出はヒアドキュメント（`cat <<EOF > file`）を検知しない。現状は許容範囲。
- Python バージョンは 3.6.2 で確認済み。3.6 未満は非サポート（f-string を使用）。

## Next Steps
なし。
