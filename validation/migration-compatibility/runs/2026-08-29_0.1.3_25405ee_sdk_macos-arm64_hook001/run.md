# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_hook001

## Environment

- Finished: 2026-08-29 21:42 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`

## Configuration

- Temporarily selected the real user setting source with one sanitized Bash `PreToolUse` recorder.
- Guarded real settings SHA-256: `5dc7d8ff06a744d9cb0c376ac468fa7e1febb0038365cf293eab4363e8a90731`.

## Commands and actions

Ran a no-tool control and one exact read-only Bash target in fresh Sessions, captured SDK activity and
independent hook JSONL, restored the original user settings bytes, removed the temporary log, hashed native
transcripts and fixtures, and reviewed event cardinality/scope.

## Cases selected

- `cases/CLD-HOOK-001--user-pretooluse-hook.md`

## Deviations

- None.

## Evidence index

- `probe.mjs`, `user-settings.json`, `record-pretool.mjs`
- `evidence/CLD-HOOK-001/hook-evidence.json`
- `evidence/CLD-HOOK-001/observations.md`
- `evidence/CLD-HOOK-001/review.md`
