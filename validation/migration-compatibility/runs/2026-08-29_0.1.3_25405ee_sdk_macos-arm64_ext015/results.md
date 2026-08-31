# Claude Run Results

| Requirement | Case | Backend | Result | Duration | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| CLD-EXT-015 | `cases/CLD-EXT-015--plugin-mcp.md` | sdk | pass | 18.2s | `evidence/CLD-EXT-015/` | Plugin-namespaced MCP tool is discovered independently, approved once, called once, attributed, and returned exactly |

## Failures

None.

## Blocked cases

None.

## Summary

- Passed: 1
- Failed: 0
- Blocked: 0
- Not run: 0
- SDK applicability: installed plugin MCP discovery, namespace, STDIO execution, approval, exact
  input/result, MCP-server attribution, DSH projection, and cleanup are verified.
