# Claude Run Results

| Requirement | Case | Backend | Result | Duration | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| CLD-EXT-009 | `cases/CLD-EXT-009--mcp-result-types.md` | sdk | pass | 41.8s | `evidence/CLD-EXT-009/` | Text, structured JSON, and exact PNG each survive one isolated MCP call and grounded synthesis |

## Failures

None.

## Blocked cases

None.

## Summary

- Passed: 1
- Failed: 0
- Blocked: 0
- Not run: 0
- SDK applicability: MCP text, structured JSON metadata/semantic projection, image bytes/vision,
  DSH image promotion, and content-addressed reuse are verified.
