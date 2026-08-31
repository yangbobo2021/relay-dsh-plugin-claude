# Claude Run Results

| Requirement | Case | Backend | Result | Duration | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| CLD-EXT-016 | `cases/CLD-EXT-016--plugin-hook.md` | sdk | pass | 19.1s | `evidence/CLD-EXT-016/` | Plugin PreToolUse Hook fires once only for target Bash and records exact event before successful completion; approval is bypassed |

## Failures

None for Hook observation. Approval bypass is retained for `CLD-PERM-004`.

## Blocked cases

None.

## Summary

- Passed: 1
- Failed: 0
- Blocked: 0
- Not run: 0
- SDK applicability: installed plugin Hook discovery/execution, matcher isolation, exact external event
  capture, native/DSH tool continuity, and cleanup are verified; permission interaction is risky.
