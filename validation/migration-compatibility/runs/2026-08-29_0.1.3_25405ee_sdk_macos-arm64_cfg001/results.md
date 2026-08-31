# Results

| Requirement | Case | Backend | Result | Duration | Evidence | Summary |
|---|---|---|---|---:|---|---|
| CLD-CFG-001 | `cases/CLD-CFG-001--user-settings.md` | sdk | pass | 20.8s | `evidence/CLD-CFG-001/` | User-source exact Bash is denied; source-disabled control returns exact stdout; settings restored |

## State effects

- Real user settings restored to original 38 bytes and SHA-256.
- No Workspace, nested Git, DSH object-store, marketplace or plugin-state change.
- Two expected native transcripts were created; invalid pre-model attempts are excluded.
