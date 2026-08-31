# Claude Run Results

| Requirement | Case | Backend | Result | Duration | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| CLD-IMG-001 | `cases/CLD-IMG-001--single-image-understanding.md` | sdk | pass | 9.4s + 7.6s LLM | `evidence/CLD-IMG-001/` | Closed-vocabulary rerun returns exact visual record; image bytes match across fixture, DSH, and native SDK content |

## Failures

None.

## Blocked cases

None.

## Summary

- Passed: 1
- Failed: 0
- Blocked: 0
- Not run: 0
- SDK applicability: single PNG visual understanding verified.
- CLI fallback applicability: text-only and not evaluated live here.
