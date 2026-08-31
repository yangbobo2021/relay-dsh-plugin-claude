# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_tool016

## Environment

- Finished: 2026-08-29 18:16 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec artifact additions only; product source unchanged

## Configuration

- Isolated DSH/link environment `/private/tmp/relay-cld-live002.p2EkK4/`
- Dedicated tool Workspace; fresh Claude Sonnet/Medium/Workspace Write Session
- One foreground `general-purpose` Agent child with a fixed no-tool prompt

## Commands and actions

Captured state, required one Agent, captured the exact parent final, inspected native structured
Agent result and usage, located/inspected independent child transcript and metadata, inspected DSH
activity/link continuity, compared Workspace/Git/object state, and self-reviewed.

## Cases selected

- `cases/CLD-TOOL-016--agent-subagent.md`

## Deviations

- Agent was already available to Claude, so the permitted ToolSearch preflight was unnecessary and
  did not run.

## Evidence index

- `evidence/CLD-TOOL-016/agent-subagent-evidence.json`
- `evidence/CLD-TOOL-016/observations.md`
- `evidence/CLD-TOOL-016/final.png`
- `evidence/CLD-TOOL-016/review.md`
