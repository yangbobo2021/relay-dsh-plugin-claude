# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_hook002

## Environment

- Finished: 2026-08-29 21:45 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`

## Configuration

- Temporarily created the previously absent fixture-project `.claude/settings.json` with one sanitized
  Bash `PostToolUse` recorder; selected only the project setting source.

## Commands and actions

Ran fresh no-tool and exact Bash Sessions, captured SDK and independent hook evidence, removed settings/log,
hashed both native transcripts and fixtures, and self-reviewed completed-response identity and cleanup.

## Cases selected

- `cases/CLD-HOOK-002--project-posttooluse-hook.md`

## Deviations

- None.

## Evidence index

- `probe.mjs`, `project-settings.json`, `record-posttool.mjs`
- `evidence/CLD-HOOK-002/hook-evidence.json`
- `evidence/CLD-HOOK-002/observations.md`
- `evidence/CLD-HOOK-002/review.md`
