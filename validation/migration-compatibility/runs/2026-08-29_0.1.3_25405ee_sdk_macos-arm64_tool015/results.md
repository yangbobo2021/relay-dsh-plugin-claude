# Claude Run Results

| Requirement | Case | Backend | Result | Duration | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| CLD-TOOL-015 | `cases/CLD-TOOL-015--tool-approval.md` | sdk | pass | allow 9.004s; deny settled 12.656s + 3s safety | `evidence/CLD-TOOL-015/` | Allow-once creates exact file; reject creates none and returns explicit error |

## Failures

None.

## Blocked cases

None.

## Summary

- Passed: 1
- Failed: 0
- Blocked: 0
- Not run: 0
- SDK applicability: independent allow and deny approval enforcement verified.
