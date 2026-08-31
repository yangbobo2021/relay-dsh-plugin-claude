# CLD-EXT-004 Observations

- Prompt contains the trigger but not Skill/tool name or result marker. Claude automatically calls
  one Skill with exact user fixture and passes the trigger as `args`.
- Native post-tool user context persists the global base directory, full fixture body, and arguments;
  exact final is the body-only automatic marker. No project Skill or other tool runs.
- DSH mirrors one Skill start/completion and a completed turn. Workspace/Git/object state is stable.
