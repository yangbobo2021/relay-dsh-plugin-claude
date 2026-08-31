# Claude Run Results

| Requirement | Case | Backend | Result | Duration | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| CLD-TOOL-005 | `cases/CLD-TOOL-005--edit-one-line.md` | sdk | pass | 27s model; 34s capture | `evidence/CLD-TOOL-005/` | Optional Read then one allowed-once Edit produces exact one-line after digest; no alternate mutation |

## Failures

None.

## Blocked cases

None.

## Summary

- Passed: 1
- Failed: 0
- Blocked: 0
- Not run: 0
- SDK applicability: targeted built-in Edit and approval path verified.
- Prompt conformance note: Claude added a harmless Read preflight against the original
  overly strict method wording.
