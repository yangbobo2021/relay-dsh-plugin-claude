# CLD-EXT-006 Validation Review

## Reasonableness

- A real STDIO server, independent append-only call oracle, marker absent from the prompt, native
  MCP attribution, and DSH lifecycle collectively prove transport rather than answer guessing.
- Deferred ToolSearch is required schema discovery for this Claude tool set and is not an alternate
  way to perform the business task. Exactly one MCP business call remains the duplication oracle.
- Counting one server process was too strict because the plugin owns a separate title Session and
  the engine may initialize MCP more than once. Recording all PIDs while requiring one business
  call tests capability without hiding the measurable startup overhead.

## Reliability

- Five independent surfaces agree: temporary user config, deferred-tool delta, server call log,
  native tool/result/attribution, and DSH approval/activity/final. Exact hashes freeze each source.
- Project config absence and stable Workspace/Git/object state isolate user scope. Semantic cleanup
  removes only the fixture key and confirms zero processes; avoiding a stale full-file restore
  preserves unrelated Claude-owned cache updates and user state.

## Verdict

**Pass, high confidence.** User-scoped STDIO MCP loads and completes one exact tool call through the
plugin. Four short-lived process starts are a retained efficiency observation, not duplicate work.
