# Results

| Requirement | Case | Backend | Result | Duration | Evidence | Summary |
|---|---|---|---|---:|---|---|
| CLD-SES-006 | `cases/CLD-SES-006--sdk-cli-applicability.md` | sdk + cli | pass | 0.6s | `evidence/CLD-SES-006/` | Active baseline is SDK; CLI claims limited to directly tested contracts |

## Summary

- Passed: 1
- Failed: 0
- Blocked: 0
- Not run: 0
- SDK applicability: production default and all prior migration cases use the SDK baseline unless explicitly stated.
- CLI fallback applicability: separately bounded; no SDK-only result is inherited.
