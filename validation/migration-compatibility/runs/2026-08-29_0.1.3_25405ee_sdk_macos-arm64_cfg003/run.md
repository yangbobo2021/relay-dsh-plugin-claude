# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_cfg003

## Environment

- Finished: 2026-08-29 19:54 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64

## Configuration

- Shared env value `SHARED_3003`; local env value `LOCAL_3003` in one isolated fixture project
- Real SDK Sessions with sources `["project","local"]` and `["project"]`

## Commands and actions

Ran the same variable-print command in two fresh Sessions, accepted one expansion approval each,
captured exact SDK source lists, tool inputs/stdout/finals and native transcripts, hashed settings and
state, and self-reviewed the first invalid approval-response attempt separately.

## Cases selected

- `cases/CLD-CFG-003--project-local-settings.md`

## Deviations

- First attempt responded to approval with unsupported action `allowOnce`; the client correctly mapped
  it to deny, so both branches were invalid. The probe was corrected to `accept` and rerun; only that
  successful controlled differential is used.

## Evidence index

- `probe.mjs`
- `evidence/CLD-CFG-003/local-override-evidence.json`
- `evidence/CLD-CFG-003/observations.md`
- `evidence/CLD-CFG-003/review.md`
