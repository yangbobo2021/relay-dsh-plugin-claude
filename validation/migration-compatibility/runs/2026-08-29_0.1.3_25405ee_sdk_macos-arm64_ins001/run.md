# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_ins001

## Environment

- Finished: 2026-08-29 20:15 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64

## Configuration

- Temporary user `~/.claude/CLAUDE.md`; baseline file absent
- User-source and no-source fresh Sessions with identical opaque query and no tools

## Commands and actions

Confirmed absence; created sanitized rule; ran user-source query; deleted the file; ran identical
source-disabled control; captured exact finals/source options/native histories/state; verified cleanup
absence in normal path and `finally`; self-reviewed coincidence and prompt-marker leakage.

## Cases selected

- `cases/CLD-INS-001--user-claude-md.md`

## Deviations

- Native transcript persists the applied answer but does not serialize the user memory file path/body;
  causality is established by the source/file differential rather than a claimed attachment record.

## Evidence index

- `user-CLAUDE.md`
- `probe.mjs`
- `evidence/CLD-INS-001/user-instruction-evidence.json`
- `evidence/CLD-INS-001/observations.md`
- `evidence/CLD-INS-001/review.md`
