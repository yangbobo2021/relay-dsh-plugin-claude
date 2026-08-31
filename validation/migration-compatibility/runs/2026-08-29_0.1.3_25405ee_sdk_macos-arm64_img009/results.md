# Claude Run Results

| Requirement | Case | Backend | Result | Duration | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| CLD-IMG-009 | `cases/CLD-IMG-009--svg-output-conversion.md` | sdk | pass | focused tests 197.64ms; live 2 x 7s | `evidence/CLD-IMG-009/` | Both fresh Sessions promote the safe SVG to the same immutable PNG object; no SVG attachment or second object |

## Failures

None.

## Blocked cases

None.

## Summary

- Passed: 1
- Failed: 0
- Blocked: 0
- Not run: 0
- SDK applicability: deterministic safe-SVG rasterization and durable PNG promotion verified.
- CLI fallback applicability: not applicable to DSH attachment presentation.
