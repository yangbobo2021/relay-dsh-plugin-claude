# Claude Run Results

| Requirement | Case | Backend | Result | Duration | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| CLD-IMG-005 | `cases/CLD-IMG-005--invalid-image-rejection.md` | sdk | pass | 202ms focused tests + live submit | `evidence/CLD-IMG-005/` | Zero SDK query/create/send and no model-bearing live event; generic error and empty DSH shell are retained UX limitations |

## Failures

None for pre-SDK rejection. Error specificity and empty-shell cleanup are product gaps.

## Blocked cases

None.

## Summary

- Passed: 1
- Failed: 0
- Blocked: 0
- Not run: 0
- SDK applicability: invalid image rejection before query verified.
- CLI fallback applicability: text-only and covered separately by its own rejection test.
