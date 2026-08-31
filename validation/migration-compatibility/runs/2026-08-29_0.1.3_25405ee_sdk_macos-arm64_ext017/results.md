# Claude Run Results

| Requirement | Case | Backend | Result | Duration | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| CLD-EXT-017 | `cases/CLD-EXT-017--multiple-plugin-sources.md` | sdk | pass | 16.1s | `evidence/CLD-EXT-017/` | Two marketplaces' same-basename Skills coexist once per namespace, load in order, retain distinct bodies/paths/tool IDs, and synthesize exactly |

## Failures

None.

## Blocked cases

None.

## Summary

- Passed: 1
- Failed: 0
- Blocked: 0
- Not run: 0
- SDK applicability: multiple CLI plugin sources, same-basename namespace isolation, ordered dual
  invocation, per-call body/path provenance, DSH projection, and cleanup are verified.
