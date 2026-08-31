# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_ext015

## Environment

- Finished: 2026-08-29 19:26 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- Install CLI / DSH / platform: Claude Code `2.1.248` / official `0.1.0-rc.8` / macOS arm64
- Repository state: validation/spec artifact additions only; product source unchanged

## Configuration

- User-scoped CLI install of fixture plugin `1.0.3` with one bundled STDIO MCP server/tool
- Separate fresh unrelated discovery and exact business-call Sessions
- Append-only independent server log in `/private/tmp`, archived here before deletion

## Commands and actions

Recorded exact baselines; validated/installed the immutable fixture; checked CLI MCP inventory; ran
an unrelated no-tool discovery Session to capture the real plugin namespace; ran a fresh exact
ToolSearch/call Session and allowed it once; compared installed files, server log, native attribution,
DSH approval/lifecycle/final, UI/source/state/process evidence; self-reviewed initialization starts
separately from calls; then uninstalled, restored all user paths/bytes, and removed the temp log.

## Cases selected

- `cases/CLD-EXT-015--plugin-mcp.md`

## Deviations

- Four server processes start per DSH Session because business and auxiliary initialization each
  create short-lived MCP clients. The independent log separates eight starts/connections from the
  single business `tool-call`; there is no business retry.
- Native MCP result attribution is stored as `attributionMcpServer` rather than `attributionPlugin`:
  `plugin:relay-cld-installed-fixture:relay-cld-plugin-mcp` preserves both identities.

## Evidence index

- `server-log.jsonl`
- `evidence/CLD-EXT-015/plugin-mcp-evidence.json`
- `evidence/CLD-EXT-015/observations.md`
- `evidence/CLD-EXT-015/mcp-final.png`
- `evidence/CLD-EXT-015/review.md`
