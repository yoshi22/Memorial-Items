# 2026-04-17 22:00 — Introduce development log enforcement

## Summary
Added a Claude Code hooks-based system that detects code/config file changes and blocks task completion (Stop/SubagentStop) if `docs/development-log/` has not been updated during the session. Detection is deterministic (script-based, not LLM-based). This is the first log entry, created as part of this introduction work.

## Background
MVP implementation was completed without any change history outside of git. To keep the project auditable and decisions traceable, enforce that every code/config change is accompanied by a short dev log entry. The enforcement should be automatic and hard to forget, hence the hooks approach.

## Changes
- **Created** `.claude/hooks/track_code_changes.py` — PostToolUse hook; records Write/Edit/Bash mutations to `.claude/state/code_changes.json`
- **Created** `.claude/hooks/check_dev_log.py` — Stop/SubagentStop hook; exits 2 if no dev log updated since first tracked change
- **Created** `.claude/settings.json` — wires PostToolUse (Write|Edit, Bash) and Stop/SubagentStop hooks
- **Created** `docs/development-log/_template.md` — 7-heading template (Summary / Background / Changes / Decisions / Validation / Open Issues / Next Steps)
- **Created** `docs/development-log/2026-04-17_2200_introduce-dev-log-enforcement.md` — this file
- **Updated** `.gitignore` — added `.claude/state/`
- **Updated** `CLAUDE.md` — added `## Development log discipline` section

## Decisions
- **Python3 with stdlib only**: no dependency installation required; always available on macOS/Linux
- **Deterministic detection**: Write/Edit → file_path check; Bash → mutation regex. No LLM involved.
- **Bash: warn not block**: Bash command regex can produce false positives (e.g., echo ">" in a string). Hard-blocking would frustrate; warning-level is sufficient.
- **State in `.claude/state/`**: keeps session state local and gitignored. Simple flat JSON, easily inspectable.
- **One log per session**: multiple file changes → one entry. File-level 1:1 enforcement would produce noise, not signal.
- **Manual bypass via state delete**: escape hatch for read-only sessions or maintenance tasks without code changes.

## Validation
```bash
# Tracker test
echo '{"tool_name":"Write","tool_input":{"file_path":"lib/foo.ts"}}' \
  | python3 .claude/hooks/track_code_changes.py
# → .claude/state/code_changes.json created with 1 entry

# Checker test (no log yet → should exit 2)
python3 .claude/hooks/check_dev_log.py; echo "exit: $?"
# → ⚠️  Development log required ... / exit: 2

# After creating this log → should exit 0
python3 .claude/hooks/check_dev_log.py; echo "exit: $?"
# → exit: 0, state file cleared

# gitignore check
git check-ignore -v .claude/state/code_changes.json
# → .gitignore:8:.claude/state/	.claude/state/code_changes.json

# settings.json syntax
python3 -c "import json; json.load(open('.claude/settings.json')); print('OK')"
# → OK
```

## Open Issues
- Hook `command` path uses `python3` — assumes Python 3 is on PATH. No known environment where this would fail for this project (macOS + standard dev setup), but worth noting.
- Bash mutation regex may miss edge cases (heredocs, complex pipes). Accepted as known limitation.

## Next Steps
- None. System is operational from this session forward.
