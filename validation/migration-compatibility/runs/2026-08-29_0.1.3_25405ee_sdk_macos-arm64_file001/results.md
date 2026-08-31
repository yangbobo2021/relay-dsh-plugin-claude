# Claude Run Results

| Requirement | Case | Backend | Result | Duration | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| CLD-FILE-001 | `cases/CLD-FILE-001--text-source-attachment.md` | sdk | fail | pre-SDK | `evidence/CLD-FILE-001/` | DSH composer has no general file control and rejects/drops `text/plain` file items before Claude; only an empty Session shell is created |

## Failures

- `CLD-FILE-001`: no user path can submit a text/source attachment to the Claude plugin.

## Blocked cases

None.

## Summary

- Passed: 0
- Failed: 1
- Blocked: 0
- Not run: 0
- SDK applicability: fails before the SDK query boundary.
- CLI fallback applicability: not relevant to the DSH migration product surface.
