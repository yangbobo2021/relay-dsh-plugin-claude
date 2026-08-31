# Results

| Requirement | Case | Backend | Result | Duration | Evidence | Summary |
|---|---|---|---|---:|---|---|
| CLD-CFG-004 | `cases/CLD-CFG-004--settings-precedence.md` | sdk | pass | 29.9s | `evidence/CLD-CFG-004/` | Same env read resolves USER, PROJECT, LOCAL as sources are progressively included |

## State effects

- Fixture/spec artifacts and three expected native transcripts only; real settings restored to original SHA.
