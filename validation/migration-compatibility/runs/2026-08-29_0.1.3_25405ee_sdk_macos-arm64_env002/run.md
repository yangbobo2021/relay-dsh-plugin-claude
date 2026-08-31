# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_env002

## Environment

- Finished: 2026-08-29 22:09 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`

## Configuration

- Production Runtime/SDK cwd: `fixtures/环境 空格-workspace/`; empty setting sources.

## Commands and actions

Ran exact `pwd`, Read and Write sequence, accepted one Write approval, compared all path layers and bytes,
removed output, hashed source/native/probe and self-reviewed Unicode/spaced path preservation.

## Cases selected

- `cases/CLD-ENV-002--unicode-spaced-cwd.md`

## Deviations

- Before any model call, preflight corrected URL `.pathname` to standard `fileURLToPath`; no invalid run exists.

## Evidence index

- `probe.mjs`
- `evidence/CLD-ENV-002/environment-evidence.json`
- `evidence/CLD-ENV-002/observations.md`
- `evidence/CLD-ENV-002/review.md`
