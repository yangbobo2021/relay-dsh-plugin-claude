# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_ext007

## Environment

- Finished: 2026-08-29 18:44 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec artifact additions only; product source unchanged

## Configuration

- Temporary tool-workspace `.mcp.json` only; root user and sibling MCP fixture entries absent
- Immutable canonical project STDIO server with append-only isolated lifecycle/call log
- Fresh positive tool-workspace and negative plain-text-workspace Claude Sessions

## Commands and actions

Recorded scope/source baselines, installed the project config, executed one exact positive MCP call,
captured its result, switched to a fresh sibling Session and ran the same exact ToolSearch selector,
captured zero match, inspected both native/DSH chains and the unchanged server log, self-reviewed,
then removed the project config and confirmed all processes exited.

## Cases selected

- `cases/CLD-EXT-007--project-mcp.md`

## Deviations

- Switching Workspace after creating a new composer leaves one 361-byte empty DSH shell under the
  source Workspace. It has no Claude binding, prompt, tool, or fixture process and is excluded from
  both positive and sibling business Sessions.
- Positive initialization starts two short-lived server processes; one receives the sole business
  call. Sibling execution adds no process or log line.

## Evidence index

- `server-log.jsonl`
- `evidence/CLD-EXT-007/project-mcp-evidence.json`
- `evidence/CLD-EXT-007/observations.md`
- `evidence/CLD-EXT-007/project-final.png`
- `evidence/CLD-EXT-007/sibling-final.png`
- `evidence/CLD-EXT-007/review.md`
