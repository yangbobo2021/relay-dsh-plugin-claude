# CLD-EXT-018 Observations

- Fresh native initialization advertises `CronList` once among DSH-contributed tools.
- Exact ToolSearch returns one `tool_reference` named `CronList`; native then calls that name once
  with `{}` and records non-error result `No scheduled jobs.`.
- DSH records matching ToolSearch and CronList completed activities; CronList executes in 10ms and
  returns the same exact result. No approval is requested for the in-process DSH tool.
- Relay source registers DSH schemas via `createSdkMcpServer({name: "dsh"})`, allowlists internal
  `mcp__dsh__${name}`, and routes execution to the DSH callback. Its digest is archived.
- No plugin/external MCP substitute, mutation, object delta, Git delta, or configuration leak exists.
