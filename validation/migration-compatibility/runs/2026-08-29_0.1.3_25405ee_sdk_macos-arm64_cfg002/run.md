# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_cfg002

## Environment

- Finished: 2026-08-29 19:52 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64

## Configuration

- Shared fixture project has one exact Bash deny in `.claude/settings.json`
- Sibling fixture project has no `.claude` configuration
- Both real SDK queries use only `settingSources: ["project"]`

## Commands and actions

Hashed fixtures/state; ran identical exact Bash prompts in independent shared/sibling project Sessions;
captured query cwd/source, tool lifecycle/stdout/finals and native transcripts; compared user settings and
object state; self-reviewed same-ID duplicate denial projection and project-boundary causality.

## Cases selected

- `cases/CLD-CFG-002--shared-project-settings.md`

## Deviations

- The configured denial projects twice as completed activity under one tool ID, as in CFG-001. Native
  history shows one call and no retry.

## Evidence index

- `probe.mjs`
- `evidence/CLD-CFG-002/project-settings-evidence.json`
- `evidence/CLD-CFG-002/observations.md`
- `evidence/CLD-CFG-002/review.md`
