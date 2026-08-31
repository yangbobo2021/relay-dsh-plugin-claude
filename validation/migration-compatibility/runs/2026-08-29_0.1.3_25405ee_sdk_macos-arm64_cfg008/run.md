# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_cfg008

## Environment

- Finished: 2026-08-29 20:13 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64

## Configuration

- Same project/Same Session; project env changes from HOT_A_8008 to HOT_B_8008 between turns
- Both turns use project source and the identical read-only subprocess command

## Commands and actions

Hashed original fixture; ran turn 1; replaced only settings bytes; resumed the same Session for turn 2;
captured query resume identity, exact calls/stdout/finals/native history; restored fixture in `finally` and
verified its SHA; self-reviewed process versus query reinitialization semantics.

## Cases selected

- `cases/CLD-CFG-008--settings-hot-reload.md`

## Deviations

- None.

## Evidence index

- `probe.mjs`
- `evidence/CLD-CFG-008/hot-reload-evidence.json`
- `evidence/CLD-CFG-008/observations.md`
- `evidence/CLD-CFG-008/review.md`
