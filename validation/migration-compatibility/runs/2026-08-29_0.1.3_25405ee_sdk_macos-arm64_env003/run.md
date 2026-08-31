# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_env003

## Environment

- Finished: 2026-08-29 22:13 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`

## Configuration

- Temporary project env with one explicitly fake secret and PATH-only neutral fixture executable.

## Commands and actions

Excluded one pre-tool refusal, then ran a neutral executable once, captured real stdout path while prohibiting
final repetition, counted exact value in SDK/native/final/diagnostics, restored settings and self-reviewed.

## Cases selected

- `cases/CLD-ENV-003--secret-redaction.md`

## Deviations

- Excluded Session `acfe5f82-ef77-46d3-9a0c-c0bfa0294e46`: explicit variable-print prompt was refused before
  any tool call, so its zero counts did not exercise redaction.

## Evidence index

- `probe.mjs`, `bin/relay-cld-env003-probe`
- `evidence/CLD-ENV-003/environment-evidence.json`
- `evidence/CLD-ENV-003/observations.md`
- `evidence/CLD-ENV-003/review.md`
