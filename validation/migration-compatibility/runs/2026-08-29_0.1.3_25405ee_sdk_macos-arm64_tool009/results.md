# Claude Run Results

| Requirement | Case | Backend | Result | Duration | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| CLD-TOOL-009 | `cases/CLD-TOOL-009--long-running-bash-streaming.md` | sdk | fail | 15.5s tool; 22.6s capture | `evidence/CLD-TOOL-009/` | FIRST and LAST became visible together only after the wait; no intermediate output event or UI state |

## Failures

- Long-running Bash stdout is buffered until tool completion rather than presented incrementally.

## Blocked cases

None.

## Summary

- Passed: 0
- Failed: 1
- Blocked: 0
- Not run: 0
- SDK applicability: terminal Bash output works; live intermediate stdout presentation does not.
