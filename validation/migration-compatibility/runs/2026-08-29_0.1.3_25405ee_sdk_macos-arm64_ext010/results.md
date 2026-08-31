# Claude Run Results

| Requirement | Case | Backend | Result | Duration | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| CLD-EXT-010 | `cases/CLD-EXT-010--mcp-failure-timeout.md` | sdk | pass | 67.2s | `evidence/CLD-EXT-010/` | Explicit MCP error and 1516ms hard timeout are visible, single-call, non-retried, and each original binding recovers |

## Failures

None.

## Blocked cases

None.

## Summary

- Passed: 1
- Failed: 0
- Blocked: 0
- Not run: 0
- SDK applicability: explicit MCP error results, project-configured request timeouts, post-error
  continuity, timeout process termination, and no-late-delivery behavior are verified.
