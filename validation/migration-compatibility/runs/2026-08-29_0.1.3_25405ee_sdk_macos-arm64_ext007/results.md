# Claude Run Results

| Requirement | Case | Backend | Result | Duration | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| CLD-EXT-007 | `cases/CLD-EXT-007--project-mcp.md` | sdk | pass | 18.9s + 8.1s | `evidence/CLD-EXT-007/` | Project tool executes once in owner and exact sibling selector returns zero matches |

## Failures

None.

## Blocked cases

None.

## Summary

- Passed: 1
- Failed: 0
- Blocked: 0
- Not run: 0
- SDK applicability: project `.mcp.json` discovery/execution and sibling-negative scoping are
  verified independently.
