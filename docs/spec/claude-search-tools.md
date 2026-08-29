# Claude Search Tool Contract

## Scope

The Claude Agent SDK backend exposes Claude's dedicated `Glob` and `Grep`
tools on every business and auxiliary query. This contract does not apply to
the text-only CLI fallback.

## Availability

Native Claude builds may otherwise provide filename and content search only
through Bash. The plugin must opt into `Glob` and `Grep` through the SDK's
`allowedTools` option so both dedicated tools are present without an approval
round trip. It must do so for new and resumed Sessions and whether or not the
owning DSH turn contributes tools.

The bare allow entries intentionally auto-approve only these two native,
read-only search tools, so the SDK does not call `canUseTool` for them. They do
not grant any mutation tool. The plugin still registers the permission callback
for every tool that is not otherwise allowed, and the SDK remains authoritative
for search path resolution and access enforcement.

The search entries augment the allowlist. They must never replace an
`mcp__dsh__*` entry created by the DSH tool bridge or alter the configured
permission mode, permission callback, working directory, plugins, or Session
continuation options.

## Delivery Acceptance

1. A query without DSH-contributed tools allows exactly the dedicated `Glob`
   and `Grep` additions and does not create a DSH MCP server.
2. A query with DSH-contributed tools preserves every generated
   `mcp__dsh__*` allow entry after `Glob` and `Grep`.
3. A fresh real SDK Session uses native `Glob` followed by native `Grep` to
   find a precommitted unique path and marker, with no Bash fallback, approval,
   or workspace mutation.
4. The same run returns the exact expected path and marker, and the recorded
   SDK initialization advertises both tool names.
5. Existing SDK option, interaction, image, plugin, and DSH tool-bridge tests
   remain green.
