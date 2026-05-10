#!/usr/bin/env python3
"""PostToolUse hook: records code/config file changes to .claude/state/code_changes.json."""
import json
import re
import sys
import time
from pathlib import Path

TRACKED_EXTENSIONS = {
    '.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rb', '.java', '.rs', '.sh',
    '.json', '.yaml', '.yml', '.toml',
}
TRACKED_NAMES = {'.env.example'}
EXCLUDED_PREFIXES = (
    'node_modules/', '.next/', '.git/', 'coverage/', '.vercel/',
    'docs/development-log/', '.claude/state/',
)
# Only track shell redirects that write to a file: "> path" or ">> path"
REDIRECT_RE = re.compile(r'>>?\s+([\w./\-]+)')

STATE_DIR = Path('.claude/state')
STATE_FILE = STATE_DIR / 'code_changes.json'


def is_tracked(path: str) -> bool:
    if not path:
        return False
    p = path.lstrip('/')
    for prefix in EXCLUDED_PREFIXES:
        if p.startswith(prefix) or ('/' + prefix) in ('/' + p):
            return False
    # strip leading ./
    p2 = p.lstrip('./')
    if p2.startswith('.claude/'):
        return True
    if p.startswith('.claude/'):
        return True
    ext = Path(path).suffix.lower()
    if ext in TRACKED_EXTENSIONS:
        return True
    if Path(path).name in TRACKED_NAMES:
        return True
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
        if is_tracked(path):
            append_entry(path, tool_name)

    elif tool_name == 'Bash':
        command = tool_input.get('command', '')
        for m in REDIRECT_RE.finditer(command):
            target = m.group(1)
            if is_tracked(target):
                append_entry(target, 'Bash')
                break


if __name__ == '__main__':
    try:
        main()
    except Exception:
        pass
    sys.exit(0)
