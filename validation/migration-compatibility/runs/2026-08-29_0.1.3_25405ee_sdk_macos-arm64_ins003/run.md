# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_ins003

## Environment

- Finished: 2026-08-29 20:19 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64

## Configuration

- One `.claude/rules/ins003.md` with path glob `src/**`
- Matching `src/target.txt` and nonmatching `docs/other.txt`; project-source fresh Sessions

## Commands and actions

Ran one exact Read in each branch followed by the same opaque query; captured Read inputs/outputs,
finals/native histories and state; hashed rule/probe; self-reviewed applicability and marker leakage.

## Cases selected

- `cases/CLD-INS-003--project-rules.md`

## Deviations

- None.

## Evidence index

- `probe.mjs`
- `evidence/CLD-INS-003/project-rule-evidence.json`
- `evidence/CLD-INS-003/observations.md`
- `evidence/CLD-INS-003/review.md`
