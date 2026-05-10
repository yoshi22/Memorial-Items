#!/usr/bin/env python3
"""Stop/SubagentStop hook: blocks completion if code changed without a new dev log entry."""
import json
import sys
from pathlib import Path

STATE_FILE = Path('.claude/state/code_changes.json')
DEV_LOG_DIR = Path('docs/development-log')


def main() -> None:
    if not STATE_FILE.exists():
        sys.exit(0)

    try:
        entries = json.loads(STATE_FILE.read_text())
    except Exception:
        sys.exit(0)

    if not entries:
        sys.exit(0)

    first_change_ts: float = entries[0]['ts']

    latest_log_mtime = 0.0
    if DEV_LOG_DIR.exists():
        for f in DEV_LOG_DIR.glob('*.md'):
            if f.name == '_template.md':
                continue
            mtime = f.stat().st_mtime
            if mtime > latest_log_mtime:
                latest_log_mtime = mtime

    if latest_log_mtime > first_change_ts:
        if STATE_FILE.exists():
            STATE_FILE.unlink()
        sys.exit(0)

    changed = [e['path'] for e in entries]
    preview = ', '.join(changed[:5])
    suffix = f' ... (+{len(changed) - 5} more)' if len(changed) > 5 else ''
    msg = (
        '\n⚠️  Development log required before completing this task.\n'
        f'  Changed: {preview}{suffix}\n'
        '  → Create docs/development-log/YYYY-MM-DD_HHMM_<title>.md\n'
        '  → Template: docs/development-log/_template.md\n'
        '  → To skip enforcement: rm .claude/state/code_changes.json\n'
    )
    print(msg, file=sys.stderr)
    sys.exit(2)


if __name__ == '__main__':
    main()
