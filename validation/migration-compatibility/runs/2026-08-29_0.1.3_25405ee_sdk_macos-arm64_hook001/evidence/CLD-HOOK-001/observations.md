# Observations

- The no-tool Session completed with the exact control marker and produced no hook record.
- The target Session made one Bash call; the independent recorder captured one `PreToolUse` record with
  the exact command, target Session ID and normalized Workspace cwd before the command returned exact stdout.
- Relay emitted no approval request for this successful user hook path. This is an observation, not the
  permission verdict; `CLD-PERM-004` evaluates whether extension calls can bypass effective rules.
- The guarded user settings returned to their exact baseline digest and the temporary JSONL was removed.
