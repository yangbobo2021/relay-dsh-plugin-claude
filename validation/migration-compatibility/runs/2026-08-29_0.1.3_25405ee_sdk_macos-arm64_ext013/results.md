# Claude Run Results

| Requirement | Case | Backend | Result | Duration | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| CLD-EXT-013 | `cases/CLD-EXT-013--plugin-skill-command.md` | sdk | pass | 21.7s | `evidence/CLD-EXT-013/` | Namespaced Skill and legacy command each load once with exact body, attribution, lifecycle, and final marker |

## Failures

None.

## Blocked cases

None.

## Summary

- Passed: 1
- Failed: 0
- Blocked: 0
- Not run: 0
- SDK applicability: CLI-installed plugin Skill and legacy command discovery, namespaced invocation,
  injected body, native attribution, DSH activity projection, and cleanup are verified.
