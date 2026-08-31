# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_cfg004

## Environment

- Finished: 2026-08-29 19:56 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64

## Configuration

- One env key conflicts as USER_4004, PROJECT_4004 and LOCAL_4004
- Three independent real SDK Sessions progressively include user, project and local sources
- Original user settings guarded and restored byte-exactly

## Commands and actions

Applied sanitized user fixture under byte backup; ran three identical env-print commands with progressive
source sets; accepted unchanged expansion approvals; restored settings in `finally`; captured options,
stdout/finals/native histories and state; self-reviewed the full precedence chain.

## Cases selected

- `cases/CLD-CFG-004--settings-precedence.md`

## Deviations

- None in the valid run.

## Evidence index

- `probe.mjs`
- `user-settings.json`
- `evidence/CLD-CFG-004/precedence-evidence.json`
- `evidence/CLD-CFG-004/observations.md`
- `evidence/CLD-CFG-004/review.md`
