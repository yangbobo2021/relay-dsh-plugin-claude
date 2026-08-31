# CLD-EXT-015 Self-review

## Process review

- A prompt-independent discovery Session establishes the real generated namespace before the exact
  business call, preventing a guessed selector from being mistaken for successful discovery.
- CLI inventory and installed-file digests prove the MCP is plugin-bundled, not project/user config.
- Independent append-only server logging is compared with native and DSH records; the final answer is
  not treated as sole evidence.
- Initialization process starts are explicitly separated from business calls.

## Reliability review

- Exactly one selector, one native business call, one server business call, and one DSH completed
  business activity rule out retries/fallbacks despite eight client-process starts.
- One approval asked and allowed once proves the plugin MCP does not bypass Relay's approval surface.
- `attributionMcpServer` binds the result to both plugin and bundled server.
- Exact restoration of user config/cache plus zero process/temp log and object/Git/source invariants
  exclude leakage and unrelated mutation.

## Verdict

Pass. An installed plugin's bundled MCP server is independently discovered and its namespaced tool
executes once with intact approval, input, result, attribution, and cleanup through Relay Claude SDK.
