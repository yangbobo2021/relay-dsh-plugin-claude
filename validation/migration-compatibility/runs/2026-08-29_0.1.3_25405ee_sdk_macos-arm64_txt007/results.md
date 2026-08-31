# Claude Run Results

| Requirement | Case | Backend | Result | Duration | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| CLD-TXT-007 | `cases/CLD-TXT-007--stop-generation.md` | sdk | pass | stop at 7.45s; 12s late window; 6s recovery | `evidence/CLD-TXT-007/` | User-aborted partial text stays stable/no terminal end marker; same Session recovers |

## Failures

None.

## Blocked cases

None.

## Summary

- Passed: 1
- Failed: 0
- Blocked: 0
- Not run: 0
- SDK applicability: active text generation interruption verified.
- CLI fallback applicability: not evaluated.
