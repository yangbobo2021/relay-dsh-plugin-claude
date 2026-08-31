# Results

| Requirement | Case | Backend | Result | Duration | Evidence | Summary |
|---|---|---|---|---:|---|---|
| CLD-CFG-002 | `cases/CLD-CFG-002--shared-project-settings.md` | sdk | pass | 22.4s | `evidence/CLD-CFG-002/` | Shared project denies exact Bash; sibling returns exact stdout under the same project-only source |

## State effects

- Validation fixture additions and two expected native transcripts only.
- User settings, DSH objects and existing Workspace/Git baselines are unchanged.
