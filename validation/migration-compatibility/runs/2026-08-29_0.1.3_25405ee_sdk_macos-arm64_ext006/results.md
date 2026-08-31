# Claude Run Results

| Requirement | Case | Backend | Result | Duration | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| CLD-EXT-006 | `cases/CLD-EXT-006--user-stdio-mcp.md` | sdk | pass | 26.1s | `evidence/CLD-EXT-006/` | User MCP is discovered through ToolSearch and executes one exact STDIO business call |

## Failures

None.

## Blocked cases

None.

## Summary

- Passed: 1
- Failed: 0
- Blocked: 0
- Not run: 0
- SDK applicability: user-scoped STDIO MCP discovery, approval, call transport, result, and final
  grounding are verified; four idle/startup process instances are retained as overhead evidence.
