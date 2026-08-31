# CLD-TOOL-002 Observations

- The unique filename and marker each occur exactly once before the turn.
- Claude first attempted `ToolSearch(select:Glob,Grep)`, which returned exactly
  `No matching deferred tools found`. Two semantic ToolSearch queries returned unrelated
  tools and no Glob or Grep reference.
- Claude explicitly reasoned that dedicated Glob/Grep were absent, then invoked Bash with
  forbidden `find` and `grep`. Bash found the correct single fixture and marker.
- The final content is exact, but native and DSH activity contain no Glob/Grep tool use.
- No approval, file mutation, or attachment-object change occurred.
