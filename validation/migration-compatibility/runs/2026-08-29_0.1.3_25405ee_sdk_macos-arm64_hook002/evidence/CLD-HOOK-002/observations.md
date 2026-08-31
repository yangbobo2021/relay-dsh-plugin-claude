# Observations

- No hook record appeared for a project-source no-tool control.
- One Bash target produced one `PostToolUse` record whose response contains exact stdout, empty stderr,
  `interrupted: false`, and the same command/Session/cwd as the SDK/native activity.
- No approval request, fallback call or diagnostic occurred.
- The project had no settings file before the trial; it and the temporary JSONL are absent afterward.
