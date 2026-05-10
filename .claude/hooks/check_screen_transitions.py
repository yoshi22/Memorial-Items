#!/usr/bin/env python3
"""Stop/SubagentStop hook: blocks completion if route files changed without updating screen transitions doc."""
import json
import sys
from pathlib import Path

STATE_FILE = Path('.claude/state/route_changes.json')
TRANSITIONS_DOC = Path('docs/09_screen_transitions.md')


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

    doc_mtime = 0.0
    if TRANSITIONS_DOC.exists():
        doc_mtime = TRANSITIONS_DOC.stat().st_mtime

    if doc_mtime > first_change_ts:
        if STATE_FILE.exists():
            STATE_FILE.unlink()
        sys.exit(0)

    changed = [e['path'] for e in entries]
    preview = ', '.join(changed[:5])
    suffix = f' ... (+{len(changed) - 5} more)' if len(changed) > 5 else ''
    msg = (
        '\n⚠️  Screen transition doc update required.\n'
        f'  Changed: {preview}{suffix}\n'
        '  → Update docs/09_screen_transitions.md to reflect route/email changes\n'
        '  → To skip enforcement: rm .claude/state/route_changes.json\n'
    )
    print(msg, file=sys.stderr)
    sys.exit(2)


if __name__ == '__main__':
    main()
