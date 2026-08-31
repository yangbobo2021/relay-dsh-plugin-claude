# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_ext016

## Environment

- Finished: 2026-08-29 19:31 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- Install CLI / DSH / platform: Claude Code `2.1.248` / official `0.1.0-rc.8` / macOS arm64
- Repository state: validation/spec artifact additions only; product source unchanged

## Configuration

- User-scoped CLI install of fixture plugin `1.0.4` with one Bash-matched PreToolUse command Hook
- Separate fresh no-tool negative and one-Bash target Sessions
- Append-only external hook log in `/private/tmp`, archived here before deletion

## Commands and actions

Recorded exact baselines; validated/installed the immutable fixture; checked CLI Hook inventory; ran
a no-tool negative and proved log absence; ran one exact read-only Bash target; captured hook stdin,
native tool/result, DSH lifecycle/final and approval absence, UI/source/state evidence; self-reviewed
event timing and PreToolUse permission semantics; then uninstalled, restored all user bytes/paths,
archived/deleted the temp log, and confirmed cleanup.

## Cases selected

- `cases/CLD-EXT-016--plugin-hook.md`

## Deviations

- The original case expected an allowed-once Relay approval. Instead, the plugin PreToolUse command
  exits successfully with no decision output and Claude executes Bash without calling Relay's
  approval handler. This is normal Claude Hook pre-authorization behavior but a migration/runtime
  permission interaction risk; it is retained here and will be judged under `CLD-PERM-004`.
- Claude adds a harmless `description` field to the exact Bash command input. The command itself,
  hook record, stdout, native result, DSH output, and final are exact.

## Evidence index

- `hook-log.jsonl`
- `evidence/CLD-EXT-016/plugin-hook-evidence.json`
- `evidence/CLD-EXT-016/observations.md`
- `evidence/CLD-EXT-016/hook-target-final.png`
- `evidence/CLD-EXT-016/review.md`
