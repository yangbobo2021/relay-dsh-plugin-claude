# CLD-TOOL-001 Observations

- DSH visibly selected `tool-workspace`; registration reset the agent/model as expected,
  so Claude Code/Sonnet/Medium was reselected before sending.
- Native Claude business content contains exactly one Bash `pwd` tool use and one successful
  result whose stdout is the full expected Workspace path.
- Business and auxiliary native records, DSH Session root, and link config all contain the
  same canonical cwd. DSH activity records one started and one completed Bash item.
- The terminal answer repeats that exact stdout. The turn completed with no approval.
- Workspace still contains only its unchanged marker file; no attachment object was added.
