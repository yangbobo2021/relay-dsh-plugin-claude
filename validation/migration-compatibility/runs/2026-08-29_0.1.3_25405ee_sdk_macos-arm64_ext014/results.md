# Claude Run Results

| Requirement | Case | Backend | Result | Duration | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| CLD-EXT-014 | `cases/CLD-EXT-014--plugin-agent.md` | sdk | pass | 11.1s | `evidence/CLD-EXT-014/` | One namespaced foreground Agent creates one attributed depth-1 zero-tool child and returns its exact marker to the parent |

## Failures

None.

## Blocked cases

None.

## Summary

- Passed: 1
- Failed: 0
- Blocked: 0
- Not run: 0
- SDK applicability: installed plugin Agent discovery, foreground execution, depth-1 child evidence,
  model/cwd/plugin attribution, result propagation, and cleanup are verified.
