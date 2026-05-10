# debug-issue / prompt

Debug the reported issue using a root-cause-first approach.

Steps:
1. Reproduce the issue
2. Identify impacted route/components/tables
3. Verify related DB records and state transitions
4. Explain root cause briefly
5. Apply the smallest safe fix
6. Add regression protection

Constraints:
- No speculative refactors
- No broad rewrites
- Keep within MVP architecture
