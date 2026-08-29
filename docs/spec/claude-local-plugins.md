# Claude Local Plugin Loading

## Contract

The DSH host configuration may provide `claudePlugins`, an ordered array of
Claude Agent SDK local-plugin descriptors:

```yaml
config:
  claudePlugins:
    - type: local
      path: /absolute/path/to/plugin
      skipMcpDiscovery: false
```

Each descriptor must contain `type: local` and a non-empty `path`.
`skipMcpDiscovery`, when present, must be Boolean. Unknown fields are rejected.
Relative paths remain relative and are interpreted by the Claude Agent SDK.
Relay does not check path existence before the SDK starts, avoiding a separate
check/use result from the SDK's authoritative load.

The configuration is trusted startup configuration: a local Claude plugin can
load instructions, hooks, agents, commands, Skills, and MCP definitions with the
same operating-system access as the Claude process. It is not accepted from a
conversation message or model output.

## Session behavior

- A configured list is cloned into every new business Claude SDK Session.
- A linked DSH Session resumed after a Host restart receives the current Host
  list, including when its older link record predates this option.
- Every query for that Claude Session carries the same ordered list, including
  resumed queries.
- Message-level plugin replacement is rejected before `query()`; conversation
  input and model output cannot introduce a local plugin path.
- An explicit empty list disables configured plugins for that Session.
- Hidden auxiliary Sessions, including title generation, always use an explicit
  empty list. They must not run user plugin hooks or discover user plugin Skills.
- With no configured list, Relay omits the SDK `plugins` option and preserves
  existing behavior.
- The CLI backend cannot load SDK local-plugin paths. It rejects a non-empty list
  with `CLAUDE_LOCAL_PLUGINS_REQUIRE_SDK` instead of silently dropping it.

## Delivery acceptance

| ID | Scenario | Required result |
| --- | --- | --- |
| LP1 | New Session | Runtime creation and first SDK query receive the exact ordered descriptors. |
| LP2 | Continued Session | A later query uses `resume` and receives the same descriptors. |
| LP3 | Host restart | Runtime resume receives the current configured descriptors without relying on the persisted link record. |
| LP4 | No configuration | Runtime and SDK options do not gain a `plugins` property. |
| LP5 | Auxiliary Session | Runtime creation receives `plugins: []`. |
| LP6 | Invalid configuration | Relay fails before creating a Session or invoking `query()`. |
| LP7 | CLI backend | A non-empty descriptor list fails explicitly and spawns no process. |
| LP8 | Real SDK load | With no CLI installation or setting source, SDK init reports the target plugin and namespaced Skill exactly once. |
| LP9 | Message injection | A message-level `plugins` field fails before SDK `query()` and does not alter the Session list. |
