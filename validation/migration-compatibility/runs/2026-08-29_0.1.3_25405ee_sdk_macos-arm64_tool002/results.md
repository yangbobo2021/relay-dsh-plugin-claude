# Claude Run Results

| Requirement | Case | Backend | Result | Duration | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| CLD-TOOL-002 | `cases/CLD-TOOL-002--glob-grep-search.md` | sdk | fail | 15.6s | `evidence/CLD-TOOL-002/` | Glob/Grep unavailable through ToolSearch; Claude bypasses explicit constraint with Bash find/grep although final content is correct |

## Failures

- `CLD-TOOL-002`: dedicated Glob and Grep capabilities could not be discovered or invoked.

## Blocked cases

None.

## Summary

- Passed: 0
- Failed: 1
- Blocked: 0
- Not run: 0
- Search-task fallback: Bash can complete this fixed search, but that does not preserve the
  requested Claude built-in tool capability.
