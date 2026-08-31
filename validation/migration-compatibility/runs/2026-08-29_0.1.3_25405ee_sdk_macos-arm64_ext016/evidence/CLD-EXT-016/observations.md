# CLD-EXT-016 Observations

- CLI inventories one plugin Hook event, `PreToolUse`; installed hook config/script match source.
- The no-tool Session completes exactly and leaves the external hook-log path absent.
- The target Session calls Bash exactly once. The Hook records one JSON line with exact event/tool/
  command, native Claude Session ID, and Workspace cwd.
- Hook time is 200ms after DSH activity start and 720ms before completed Bash output, establishing
  PreToolUse ordering rather than a post-hoc log.
- Native and DSH Bash results and final text are exact; no fallback/retry/mutation occurs.
- There is no Relay approval request. Successful exit from the PreToolUse Hook effectively permits
  the tool before Relay's approval handler; this is a separate permission-parity risk.
- Cleanup restores all user bytes/paths and removes the temp log.
