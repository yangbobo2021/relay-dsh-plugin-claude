# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_ext008

## Environment

- Finished: 2026-08-29 18:48 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec artifact additions only; product source unchanged

## Configuration

- Immutable Streamable HTTP fixture bound only to `127.0.0.1:47891`
- Temporary tool-workspace HTTP `.mcp.json`; root user MCP fixture absent
- Fresh Claude business binding in the previously empty tool-workspace DSH shell

## Commands and actions

Verified the port was free, started the loopback server, required ready/health evidence, installed
the temporary HTTP config, executed one exact MCP call with one approval, captured UI/native/DSH
and independent HTTP logs, self-reviewed transport/state, sent SIGINT, verified shutdown/closed
port/closed health endpoint, then removed the project config.

## Cases selected

- `cases/CLD-EXT-008--http-mcp.md`

## Deviations

- The SDK sends a `server/discover` HTTP request before standard MCP `initialize`; it is retained in
  the transport log and succeeds without changing the one-call business invariant.
- The DSH id was created as an empty shell during the prior Workspace switch, but EXT008 is its
  first prompt, Claude binding, tool activity, and completed turn.

## Evidence index

- `server-log.jsonl`
- `evidence/CLD-EXT-008/http-mcp-evidence.json`
- `evidence/CLD-EXT-008/observations.md`
- `evidence/CLD-EXT-008/final.png`
- `evidence/CLD-EXT-008/review.md`
