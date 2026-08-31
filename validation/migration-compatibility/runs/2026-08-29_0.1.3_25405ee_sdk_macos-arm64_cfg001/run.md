# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_cfg001

## Environment

- Finished: 2026-08-29 19:50 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64

## Configuration

- Sanitized user setting: exact deny for `Bash(printf CFG001_USER_SETTING_ACTIVE_1001)`
- Two independent real SDK Sessions: `settingSources: ["user"]` and `settingSources: []`
- Original user settings saved/restored byte-for-byte in script `finally`

## Commands and actions

Recorded config/Workspace/Git/object baselines; temporarily applied only the sanitized settings file;
ran the user-source branch; immediately restored original bytes; ran the source-disabled control;
captured query options, activities, native transcripts and state; removed invalid-attempt temp residue;
self-reviewed authentication isolation, duplicate denial projection and prompt markers.

## Cases selected

- `cases/CLD-CFG-001--user-settings.md`

## Deviations

- Two earlier isolated-`CLAUDE_CONFIG_DIR` attempts failed before model start with `Not logged in` because
  macOS authentication is bound to the default config location. They are excluded. The valid run uses a
  short, guarded real-settings replacement and proves exact restoration SHA after both branches.
- One native denied Bash call produces two completed Relay activity projections with the same tool ID
  (permission-denied system event and tool-result event). It is one call, not a retry.

## Evidence index

- `probe.mjs`
- `config-dir/settings.json`
- `evidence/CLD-CFG-001/user-settings-evidence.json`
- `evidence/CLD-CFG-001/observations.md`
- `evidence/CLD-CFG-001/review.md`
