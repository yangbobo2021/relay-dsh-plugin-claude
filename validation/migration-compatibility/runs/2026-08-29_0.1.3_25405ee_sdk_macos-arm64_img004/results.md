# Claude Run Results

| Requirement | Case | Backend | Result | Duration | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| CLD-IMG-004 | `cases/CLD-IMG-004--png-jpeg-gif-webp-input.md` | sdk | pass | 7.0s LLM | `evidence/CLD-IMG-004/` | All four exact media types and byte digests survive DSH→Relay→native Claude and are correctly interpreted |

## Failures

None.

## Blocked cases

None.

## Summary

- Passed: 1
- Failed: 0
- Blocked: 0
- Not run: 0
- SDK applicability: PNG, JPEG, GIF, and WebP input verified.
- CLI fallback applicability: text-only and not evaluated live here.
