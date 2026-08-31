# Results

| Requirement | Case | Backend | Result | Duration | Evidence | Summary |
|---|---|---|---|---:|---|---|
| CLD-CFG-005 | `cases/CLD-CFG-005--enabled-plugin-configuration.md` | sdk | pass | 9.6s | `evidence/CLD-CFG-005/` | Enabled fresh init contains fixture namespace; disabled fresh init omits it while plugin remains installed |

## State effects

- Two native transcripts and validation artifacts only after cleanup.
- User settings/marketplace bytes, plugin inventory and cache return exactly to baseline.
