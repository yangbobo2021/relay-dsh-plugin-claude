# Claude Run Results

| Requirement | Case | Backend | Result | Duration | Evidence | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| CLD-EXT-005 | `cases/CLD-EXT-005--skill-resource-script.md` | sdk | fail | 42.8s | `evidence/CLD-EXT-005/` | Reference succeeds, but script needs a failed first Bash plus a forbidden second recovery Bash |

## Failures

- The injected base directory was persisted correctly, but Claude did not apply it to the first
  relative script command. Exit 127 forced a duplicate Bash before the script marker appeared.

## Blocked cases

None.

## Summary

- Passed: 0
- Failed: 1
- Blocked: 0
- Not run: 0
- SDK applicability: bundled references work; reliable one-shot bundled script execution is not
  supported by this observed path.
