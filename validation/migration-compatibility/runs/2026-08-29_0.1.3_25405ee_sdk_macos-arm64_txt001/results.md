# Claude Run Results

| Requirement | Case | Backend | Result | Duration | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| CLD-TXT-001 | `cases/CLD-TXT-001--plain-text-turn.md` | sdk | pass | 8.7s LLM | `evidence/CLD-TXT-001/` | One exact terminal text block, one Claude binding, no tools, unchanged Workspace |

## Failures

None.

## Blocked cases

None. The excluded empty-configuration authentication preflight is a setup deviation,
not this formal run.

## Summary

- Passed: 1
- Failed: 0
- Blocked: 0
- Not run: 0
- SDK applicability: live SDK verified.
- CLI fallback applicability: not evaluated by this requirement.
