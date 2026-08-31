# Claude Run Results

| Requirement | Case | Backend | Result | Duration | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| CLD-EXT-012 | `cases/CLD-EXT-012--local-plugin-path.md` | sdk | fail | 13.3s | `evidence/CLD-EXT-012/` | Direct SDK loads the path, but Relay drops `plugins` at runtime creation and final query options; live init omits the fixture |

## Failures

- Relay has no exposed/preserved local-plugin configuration: `ClaudeSessionRuntime.createSession()`
  drops the field and `ClaudeSdkClient.queryOptions()` does not forward it to SDK `query()`.

## Blocked cases

None.

## Summary

- Passed: 0
- Failed: 1
- Blocked: 0
- Not run: 0
- SDK applicability: Claude Agent SDK local-path loading works in the positive control, but the Relay
  Claude plugin does not support passing that option; current migration parity is unsupported.
