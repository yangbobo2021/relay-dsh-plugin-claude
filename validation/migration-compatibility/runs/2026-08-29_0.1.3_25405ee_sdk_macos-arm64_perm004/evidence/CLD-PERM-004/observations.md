# Observations

- Without project sources, one injected MCP callback and one foreground zero-tool child Agent complete exactly.
- With project deny enabled, the still-injected/allowed MCP tool fails before its callback; Agent is unavailable
  and only a non-matching ToolSearch runs. Thus deny wins over Relay's MCP `allowedTools` list.
- No interactive request occurs: static deny is enforced before approval. Project settings are removed afterward.
- Earlier `CLD-EXT-016` no-request Hook evidence is not a bypass because no explicit deny applied there.
