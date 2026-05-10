#!/usr/bin/env python3
"""PostToolUse hook: records route/navigation file changes to .claude/state/route_changes.json."""
import json
import re
import sys
import time
from pathlib import Path

ROUTE_PATTERNS = (
    'app/',
    'components/common/Nav.tsx',
    'lib/email.ts',
    'lib/auth.ts',
)
ROUTE_SUFFIXES = ('page.tsx', 'layout.tsx', 'route.ts', 'actions.ts')
EXCLUDED_PREFIXES = (
    'node_modules/', '.next/', '.git/', 'coverage/', '.vercel/',
    'docs/', '.claude/state/',
)
REDIRECT_RE = re.compile(r'>>?\s+([\w./\-]+)')

STATE_DIR = Path('.claude/state')
STATE_FILE = STATE_DIR / 'route_changes.json'


def is_route_file(path: str) -> bool:
    if not path:
        return False
    p = path.lstrip('/')
    for prefix in EXCLUDED_PREFIXES:
        if p.startswith(prefix):
            return False
    for exact in ('components/common/Nav.tsx', 'lib/email.ts', 'lib/auth.ts'):
        if p.endswith(exact):
            return True
    if p.startswith('app/'):
        return any(p.endswith(suffix) for suffix in ROUTE_SUFFIXES)
    return False


def append_entry(path: str, tool: str) -> None:
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    entries: list = []
    if STATE_FILE.exists():
        try:
            entries = json.loads(STATE_FILE.read_text())
        except Exception:
            entries = []
    entries.append({'ts': time.time(), 'path': path, 'tool': tool})
    STATE_FILE.write_text(json.dumps(entries, indent=2))


def main() -> None:
    try:
        payload = json.load(sys.stdin)
    except Exception:
        return

    tool_name = payload.get('tool_name', '')
    tool_input = payload.get('tool_input', {})

    if tool_name in ('Write', 'Edit'):
        path = tool_input.get('file_path', '')
        if is_route_file(path):
            append_entry(path, tool_name)

    elif tool_name == 'Bash':
        command = tool_input.get('command', '')
        for m in REDIRECT_RE.finditer(command):
            target = m.group(1)
            if is_route_file(target):
                append_entry(target, 'Bash')
                break


if __name__ == '__main__':
    try:
        main()
    except Exception:
        pass
    sys.exit(0)
