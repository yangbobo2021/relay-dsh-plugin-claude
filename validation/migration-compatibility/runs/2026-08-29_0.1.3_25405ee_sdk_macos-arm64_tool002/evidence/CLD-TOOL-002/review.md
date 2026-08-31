# CLD-TOOL-002 Validation Review

## Reasonableness

- Unique path/content fixtures give objective search outputs. Naming required tools and
  prohibiting shell equivalents distinguishes Claude built-in parity from generic task
  completion.
- Allowing Claude to try exact and semantic ToolSearch queries tests dynamic discovery
  rather than declaring absence after one failed spelling.

## Reliability

- Three native ToolSearch results, Claude's own absence reasoning, actual Bash input,
  DSH activity, and zero Glob/Grep events agree. Correct final content cannot repair the
  explicit method violation because the requirement is the missing built-in capability.
- Product `sdk-client.mjs` does not explicitly disallow these built-ins; the failure is the
  effective current Claude/SDK tool surface, which is what migration users receive.

## Verdict

**Fail, high confidence.** The search task has a Bash fallback, but dedicated Glob/Grep
cannot be discovered or invoked in the current plugin Session.
