# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_ses001

## Environment

- Finished: 2026-08-29 20:46 Asia/Shanghai; operator: Codex protocol + live browser validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- DSH / SDK / Claude Code: `0.1.0-rc.8` / `0.3.233` / `2.1.233`
- Live URL / backend: `http://127.0.0.1:4394/` / `sdk`

## Configuration

- Explicit UI preset `Claude Code`; Claude Sonnet/Medium; Workspace Write; `tool-workspace`.

## Commands and actions

Captured baseline link digest, created a live UI Session, submitted one no-tool marker, inspected visible terminal
state, diffed link/native/DSH artifacts, separated title versus business Session and self-reviewed invalid shell.

## Cases selected

- `cases/CLD-SES-001--new-session-binding.md`

## Deviations

- Excluded DSH Session `session-bd9bf8c0-0bd3-43d0-9ae2-31c66692a569`: first UI attempt left the new-page
  default `标准模式` selected and failed for missing DeepSeek credentials before any Claude link existed.

## Evidence index

- `evidence/CLD-SES-001/session-evidence.json`
- `evidence/CLD-SES-001/observations.md`
- `evidence/CLD-SES-001/review.md`
