# Claude Run Results

| Requirement | Case | Backend | Result | Capability | Duration | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CLD-FILE-002 | `cases/CLD-FILE-002--document-attachment.md` | sdk | pass | gracefully unsupported | pre-SDK; rejection visible ~4s | `evidence/CLD-FILE-002/` | Valid PDF is not readable, but an immediate explicit image-format-only rejection appears and composer recovers |

## Failures

None against this requirement's explicit-rejection alternative.

## Blocked cases

None.

## Summary

- Passed: 1
- Failed: 0
- Blocked: 0
- Not run: 0
- Support classification: **unsupported with explicit rejection**, not document-reading support.
- SDK applicability: rejection occurs before an SDK query.
