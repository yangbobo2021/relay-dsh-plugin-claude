# Observations

- Both SDK queries use Session `49c3095e-02e7-4fc6-b0bb-b2f6b5c9b3c1`; query 2 is explicitly a
  resume. The observed MCP registration and allowlist change from alpha-only to beta-only.
- Native structured activity and the independent handler ledger agree: alpha executes once in turn 1,
  beta executes once in turn 2, results are exact, and no alpha handler executes in turn 2.
- The native second-turn record reports a cache miss reason of `tools_changed`, confirming Claude Code
  recognized a changed input tool definition instead of silently reusing the old tool cache.
- DSH bridge tools are `alwaysLoad: true`. Consequently their exact ToolSearch selectors return no
  deferred match even while the active tool can be invoked directly. This is expected SDK semantics,
  not missing schema: registration, allowlist, model cognition, direct call and result all agree.
- There are no Relay-client diagnostics, approval requests, fallback tools or state mutations.
