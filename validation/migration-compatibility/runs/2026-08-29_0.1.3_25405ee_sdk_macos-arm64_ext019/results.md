# Results

| Requirement | Case | Backend | Result | Duration | Evidence | Summary |
|---|---|---|---|---:|---|---|
| CLD-EXT-019 | `cases/CLD-EXT-019--dynamic-dsh-tool-refresh.md` | sdk | pass | 29.8s | `evidence/CLD-EXT-019/` | Same Session refreshes registration/allowlist from alpha to beta; A then B execute exactly once with no stale A call |

## State effects

- No Workspace, nested Git, DSH object-store, Claude settings, marketplace, or plugin-state change.
- One expected native transcript was created for the valid Session.
- The earlier invalid pre-model attempt created no handler call and is not a recorded capability run.

## Applicability

- SDK only: the CLI backend explicitly cannot expose DSH tools.
