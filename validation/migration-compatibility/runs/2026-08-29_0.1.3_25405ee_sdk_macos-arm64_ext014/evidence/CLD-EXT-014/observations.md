# CLD-EXT-014 Observations

- CLI version 1.0.2 inventory reports one Agent, `relay-probe`; fresh native initialization lists
  exactly `relay-cld-installed-fixture:relay-probe` with the canonical description.
- Parent calls `Agent` once with exact namespace, prompt/description, and `run_in_background: false`.
  No other parent tool or approval occurs.
- Native result returns the exact marker and `agentId: abb37825764ff03e1`, with usage reporting zero
  tool uses. DSH mirrors one completed Agent lifecycle and the same result.
- Child meta binds the same agent type, parent tool-use ID, description, and spawn depth 1.
- Child transcript binds the same parent Claude Session, exact Workspace cwd and agent ID, records
  Haiku, plugin/Agent attribution, zero tool calls, and exact body-only marker.
- Parent completes once with the exact child marker. The prompt never contains that marker.
- Initial listing says `Tools: All tools` despite `tools: []`; actual child behavior is zero-tool.
- Cleanup restores pre-run user bytes and removes all fixture-created install paths.
