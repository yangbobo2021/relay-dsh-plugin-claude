# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_ext002

## Environment

- Finished: 2026-08-29 18:23 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec/fixture artifact additions only; product source unchanged

## Configuration

- Project fixture only at tool-workspace `.claude/skills/relay-cld-project-skill/`
- Existing user fixture retained as global control
- Fresh Claude Sessions in tool-workspace and sibling plain-text-workspace

## Commands and actions

Installed/hashed the project fixture, ran unrelated no-tool probes in fresh project and sibling
Sessions, inspected business/auxiliary initial listings and cwd fields, inspected DSH/link state,
captured both UIs, restored tool-workspace selection, and self-reviewed.

## Cases selected

- `cases/CLD-EXT-002--project-skill-discovery.md`

## Deviations

- The title-generation auxiliary Session intentionally loads only user settings, so it lists 13
  skills in both trials. The project positive assertion uses the linked business Session, which
  loads user/project/local sources and lists 14.

## Evidence index

- `evidence/CLD-EXT-002/project-skill-discovery-evidence.json`
- `evidence/CLD-EXT-002/observations.md`
- `evidence/CLD-EXT-002/project-final.png`
- `evidence/CLD-EXT-002/sibling-final.png`
- `evidence/CLD-EXT-002/review.md`
