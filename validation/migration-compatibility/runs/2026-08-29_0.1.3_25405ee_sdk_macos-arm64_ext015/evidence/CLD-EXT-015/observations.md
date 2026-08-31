# CLD-EXT-015 Observations

- CLI inventories one bundled MCP server, `relay-cld-plugin-mcp`; installed config/server bytes match
  the canonical plugin source.
- An unrelated fresh discovery prompt uses zero tools, while both native business/auxiliary initial
  deltas expose exactly one plugin-namespaced `plugin_echo` and no pending MCP servers.
- The discovery Session creates initialization connections but zero server business calls.
- Business native transcript contains exactly one selector (`max_results: 1`) and one MCP call with
  exact `VALUE_1515`; the independent server logs exactly that one call.
- Native tool result and `attributionMcpServer` preserve the exact result and combined plugin/server
  identity. DSH records one allowed-once approval, completed lifecycle, and exact final.
- Eight process starts are four per discovery/business Session and are not calls or retries.
- After uninstall all server processes exit, user bytes/paths are restored, and the archived temp log
  is deleted from `/private/tmp`.
