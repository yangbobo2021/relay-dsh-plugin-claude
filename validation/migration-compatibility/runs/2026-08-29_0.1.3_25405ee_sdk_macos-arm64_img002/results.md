# Claude Run Results

| Requirement | Case | Backend | Result | Duration | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| CLD-IMG-002 | `cases/CLD-IMG-002--image-ocr.md` | sdk | pass | 6.6s, 7.5s, 14.1s, 7.4s LLM | `evidence/CLD-IMG-002/` | Neutral formal fixture is exact; instruction-like image produced two false `NO_IMAGE` results and is a retained safety boundary |

## Failures

None for the neutral OCR requirement. Instruction-like text in images is a known
behavioral limitation documented in the evidence.

## Blocked cases

None.

## Summary

- Passed: 1
- Failed: 0
- Blocked: 0
- Not run: 0
- SDK applicability: fixed neutral image OCR verified.
- CLI fallback applicability: text-only and not evaluated live here.
