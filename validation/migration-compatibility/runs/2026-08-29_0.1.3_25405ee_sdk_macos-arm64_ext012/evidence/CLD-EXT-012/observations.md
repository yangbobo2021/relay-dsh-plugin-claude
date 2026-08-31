# CLD-EXT-012 Observations

- The SDK declaration explicitly supports `plugins?: SdkPluginConfig[]` with local `{type, path}`.
- A real direct SDK query with no setting sources reports the fixture in `system/init.plugins`, lists
  `relay-cld-installed-fixture:installed-discovery` in both skills and slash commands, uses zero
  tools, and completes with the exact unrelated marker. The fixture and mechanism are valid.
- Capturing fakes show that even when `plugins` is supplied to `ClaudeSessionRuntime.createSession`,
  the client creation config has no `plugins`; independently, `ClaudeSdkClient` stores the input but
  its final `query()` options also have no `plugins`.
- A fresh live Relay Session after complete uninstall lists 13 Skills including the project control,
  but zero fixture namespace entries. Its unrelated prompt uses zero tools and completes exactly.
- No CLI install, enabled-plugin entry, installed registry, cache, or user setting was used or left.
