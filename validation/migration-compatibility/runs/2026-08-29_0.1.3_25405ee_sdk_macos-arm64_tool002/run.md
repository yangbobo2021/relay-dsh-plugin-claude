# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_tool002

## Environment

- Finished: 2026-08-29 17:29 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec/fixture artifact additions only; product source unchanged

## Configuration

- Isolated DSH/link environment `/private/tmp/relay-cld-live002.p2EkK4/`
- Dedicated tool Workspace with one unique nested filename and marker
- Fresh Standard/Claude Sonnet/Medium/Workspace Write Session

## Commands and actions

Proved fixture uniqueness, required dedicated Glob then Grep and explicitly prohibited
Bash/find/rg, observed three ToolSearch attempts, captured the Bash fallback and correct
answer, inspected every native tool result and DSH activity, compared state, and reviewed
whether content success could satisfy the atomic tool requirement.

## Cases selected

- `cases/CLD-TOOL-002--glob-grep-search.md`

## Deviations

Claude violated the requested method by using Bash after failing to discover Glob/Grep.
This is the observed product result and is classified as failure, not accepted as a case
deviation.

## Evidence index

- `evidence/CLD-TOOL-002/search-evidence.json`
- `evidence/CLD-TOOL-002/observations.md`
- `evidence/CLD-TOOL-002/final.png`
- `evidence/CLD-TOOL-002/review.md`
