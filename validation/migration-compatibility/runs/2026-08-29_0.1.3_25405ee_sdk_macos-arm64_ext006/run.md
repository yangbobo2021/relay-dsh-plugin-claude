# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_ext006

## Environment

- Finished: 2026-08-29 18:39 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec artifact additions only; product source unchanged

## Configuration

- One temporary root user `mcpServers.relay_cld_user_stdio` STDIO entry
- Immutable canonical Node MCP server with append-only isolated lifecycle/call log
- Fresh tool-workspace Claude Sonnet/Medium/Workspace Write Session; no project `.mcp.json`

## Commands and actions

Recorded config/source baselines, installed the temporary user MCP entry, submitted one exact
business call, allowed it once, captured UI/native/DSH/server evidence and state, self-reviewed
deferred discovery plus process multiplicity, removed the entry, and confirmed all fixture
processes exited.

## Cases selected

- `cases/CLD-EXT-006--user-stdio-mcp.md`

## Deviations

- Self-review calibrated lazy schema discovery: Claude uses one exact ToolSearch selector before
  the MCP business call. It is discovery infrastructure, not a fallback implementation.
- The runtime starts four short-lived fixture processes across business/auxiliary initialization;
  exactly one receives the business call. This overhead is recorded as an observation.
- Claude normally rewrote volatile cache fields/order in `~/.claude.json`, so cleanup verifies
  semantic removal of the fixture key rather than overwriting current user state with stale bytes.

## Evidence index

- `server-log.jsonl`
- `evidence/CLD-EXT-006/user-stdio-evidence.json`
- `evidence/CLD-EXT-006/observations.md`
- `evidence/CLD-EXT-006/final.png`
- `evidence/CLD-EXT-006/review.md`
