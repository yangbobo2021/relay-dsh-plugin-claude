# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_ses005

## Environment

- Finished: 2026-08-29 20:59 Asia/Shanghai; operator: Codex protocol + real SDK compaction validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`

## Configuration

- Project-source PreCompact/PostCompact recorders; same-session manual `/compact`; no tools.

## Commands and actions

Established marker, added three controlled neutral context turns, ran official manual compaction, captured both
hooks/native boundary/token delta, recalled marker without including it, cleaned settings/log and self-reviewed.

## Cases selected

- `cases/CLD-SES-005--compaction-continuation.md`

## Deviations

- Excluded Session `d247f69a-6423-414d-88fb-c62326f82052`: one-message `/compact` fired only PreCompact and
  returned `Not enough messages to compact.` with no PostCompact/boundary.

## Evidence index

- `probe.mjs`, `project-settings.json`, `record-compact.mjs`
- `evidence/CLD-SES-005/session-evidence.json`
- `evidence/CLD-SES-005/observations.md`
- `evidence/CLD-SES-005/review.md`
