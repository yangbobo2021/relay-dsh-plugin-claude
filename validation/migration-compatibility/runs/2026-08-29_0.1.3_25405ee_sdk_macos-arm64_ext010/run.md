# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_ext010

## Environment

- Finished: 2026-08-29 19:01 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec artifact additions only; product source unchanged

## Configuration

- Temporary project STDIO MCP with explicit-error and eight-second slow tools
- Per-server hard request timeout: 1500ms
- Two fresh tool-workspace Claude Sonnet/Medium/Workspace Write Sessions

## Commands and actions

Recorded source/config/state baselines; ran independent explicit-error and timeout Sessions; used one
exact ToolSearch selector, one business call, and one allowed-once approval in each; completed one
no-tool recovery turn on each original Claude binding; waited beyond the slow tool's eight-second
window; compared server, native, DSH, and UI evidence; self-reviewed timing and process termination;
then removed the temporary config and confirmed process, object, Git, and source invariants.

## Cases selected

- `cases/CLD-EXT-010--mcp-failure-timeout.md`

## Deviations

- The timeout is configured as 1500ms and completes 1516ms after the independent server start
  timestamp (1670ms from DSH activity start). Claude's display rounds this to `timed out after 1s`.
- The timed-out STDIO server process is terminated before its eight-second callback can append
  `tool-call-late-finish`. This is stronger isolation than allowing a late response: after waiting
  past eight seconds, no process, late log event, native result, DSH result, or UI marker exists.
- Runtime initialization starts eight short-lived server processes across the two two-turn Sessions;
  only one receives `explicit_failure` and only one receives `slow_timeout`.

## Evidence index

- `server-log.jsonl`
- `evidence/CLD-EXT-010/failure-timeout-evidence.json`
- `evidence/CLD-EXT-010/observations.md`
- `evidence/CLD-EXT-010/explicit-recovery.png`
- `evidence/CLD-EXT-010/timeout-recovery.png`
- `evidence/CLD-EXT-010/review.md`
