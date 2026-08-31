# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_ext009

## Environment

- Finished: 2026-08-29 18:53 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec artifact additions only; product source unchanged

## Configuration

- Temporary project STDIO MCP with isolated text, structured-JSON, and image tools
- Deterministic 400x400 PNG source; existing attachment object with the same content digest
- Fresh tool-workspace Claude Sonnet/Medium/Workspace Write Session

## Commands and actions

Recorded source/config/object baselines, submitted one ordered three-type request, allowed each MCP
business tool once, captured exact server/native/DSH/UI evidence, decoded and hashed the native image,
verified native `mcpMeta.structuredContent`, compared object sets and source state, self-reviewed the
progress-text and JSON projection, then removed the config and confirmed process cleanup.

## Cases selected

- `cases/CLD-EXT-009--mcp-result-types.md`

## Deviations

- One combined exact ToolSearch selector loads all three schemas instead of three selectors; its
  structured matches contain exactly the requested tools in order.
- Claude emits one visible progress sentence before the calls. The terminal synthesis block itself
  is exact, but the extra presentation text is retained as a UX observation.
- DSH reuses the already-existing content-addressed PNG object, so the justified projection produces
  zero new objects rather than one duplicate.

## Evidence index

- `server-log.jsonl`
- `evidence/CLD-EXT-009/result-types-evidence.json`
- `evidence/CLD-EXT-009/observations.md`
- `evidence/CLD-EXT-009/final.png`
- `evidence/CLD-EXT-009/review.md`
