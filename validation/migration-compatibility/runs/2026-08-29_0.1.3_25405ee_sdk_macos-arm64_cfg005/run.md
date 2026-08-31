# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_cfg005

## Environment

- Finished: 2026-08-29 20:06 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64

## Configuration

- User-installed fixture plugin `relay-cld-installed-fixture@relay-cld-validation-marketplace` 1.0.4
- Fresh enabled and disabled SDK initializations with user setting source; unrelated no-tool prompts

## Commands and actions

Captured exact user/plugin baselines; added marketplace and installed plugin; ran enabled init; disabled
the still-installed plugin and ran fresh init; inspected native Skill/Agent/command namespaces and counts;
uninstalled/removed via CLI, restored exact settings formatting, deleted only orphan fixture cache/empty
registry, verified byte SHA and empty inventory; self-reviewed installation versus boolean causality.

## Cases selected

- `cases/CLD-CFG-005--enabled-plugin-configuration.md`

## Deviations

- Uninstall leaves empty configuration fields, registry, and orphan cache by CLI design. Historical
  byte-level diff recovered the exact baseline formatting; cleanup restores both baseline SHAs.

## Evidence index

- `probe.mjs`
- `evidence/CLD-CFG-005/enabled-plugin-evidence.json`
- `evidence/CLD-CFG-005/observations.md`
- `evidence/CLD-CFG-005/review.md`
