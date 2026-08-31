# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_tool009

## Environment

- Finished: 2026-08-29 17:51 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec artifact additions only; product source unchanged

## Configuration

- Isolated DSH/link environment `/private/tmp/relay-cld-live002.p2EkK4/`
- Dedicated tool Workspace; fresh Claude Sonnet/Medium/Workspace Write Session
- Exact two-marker Bash command with a 15-second gap; no approval requested

## Commands and actions

Captured state, sent the fixed command, expanded the Bash detail while it was running, sampled
visible state 86 times through completion, captured running and final screenshots, inspected
native and DSH timelines, compared file/object state, and self-reviewed.

## Cases selected

- `cases/CLD-TOOL-009--long-running-bash-streaming.md`

## Deviations

- A five-second exploratory trial completed before cross-call sampling began. A 12-second retry
  was also not decision-quality because browser automation was split across calls; one setup
  attempt accidentally retained Standard mode and failed before Claude routing. All were excluded.
- Self-review moved the deciding run to one continuous Claude Code operation with a 15-second
  gap. Only that clean run determines the result below.

## Evidence index

- `evidence/CLD-TOOL-009/streaming-evidence.json`
- `evidence/CLD-TOOL-009/observations.md`
- `evidence/CLD-TOOL-009/running-no-output.png`
- `evidence/CLD-TOOL-009/final.png`
- `evidence/CLD-TOOL-009/review.md`
