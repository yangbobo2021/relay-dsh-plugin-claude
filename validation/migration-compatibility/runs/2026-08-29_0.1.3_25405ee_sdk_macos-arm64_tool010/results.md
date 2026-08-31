# Claude Run Results

| Requirement | Case | Backend | Result | Duration | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| CLD-TOOL-010 | `cases/CLD-TOOL-010--bash-interruption.md` | sdk | pass | stop 303ms after start proof; 18.797s post-stop | `evidence/CLD-TOOL-010/` | Immediate file proves execution; user abort persists; delayed output/file never occurs |

## Failures

None. Native Claude describes the cancellation as `User rejected tool use` even though DSH
records one allow-once decision followed by a user abort; this is a representation gap, not a
failure of the process-stop minimum observable.

## Blocked cases

None.

## Summary

- Passed: 1
- Failed: 0
- Blocked: 0
- Not run: 0
- SDK applicability: active Bash termination and suppression of delayed work verified.
