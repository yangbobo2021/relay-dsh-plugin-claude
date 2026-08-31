# CLD-TOOL-001 Validation Review

## Reasonableness

- A dedicated newly registered Workspace prevents a stale common path from accidentally
  passing. Forcing `pwd` measures the real child process rather than asking Claude to infer
  cwd from context.
- Comparing UI, DSH root, link config, all native cwd fields, tool stdout, and final text
  tests both configuration propagation and execution.

## Reliability

- Six independent surfaces agree byte-for-byte on the long unique path. Native content and
  DSH activity prove a real successful Bash call, while unchanged file/object state rules
  out an unrelated mutation.

## Verdict

**Pass, high confidence.** Claude built-in tools execute in the exact DSH-selected Workspace.
