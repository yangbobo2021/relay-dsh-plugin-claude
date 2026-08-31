# Claude Run Results

| Requirement | Case | Backend | Result | Duration | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| CLD-EXT-018 | `cases/CLD-EXT-018--dsh-contributed-tool.md` | sdk | pass | 12.3s | `evidence/CLD-EXT-018/` | Advertised DSH CronList resolves, executes once through Relay's in-process SDK MCP bridge, and returns the exact real result |

## Failures

None.

## Blocked cases

None.

## Summary

- Passed: 1
- Failed: 0
- Blocked: 0
- Not run: 0
- SDK applicability: DSH tool schema advertisement, SDK in-process MCP registration, ToolSearch
  resolution, exact call/result projection, continuity, and state safety are verified.
