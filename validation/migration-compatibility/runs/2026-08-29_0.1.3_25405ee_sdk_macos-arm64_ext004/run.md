# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_ext004

## Environment

- Finished: 2026-08-29 18:28 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec artifact additions only; product source unchanged

## Configuration

- Immutable user Skill whose description contains one exact automatic trigger
- Fresh tool-workspace Claude Sonnet/Medium/Workspace Write Session
- Prompt contains trigger only, with no Skill/tool name or expected result marker

## Commands and actions

Captured fixture/state, sent the trigger-only prompt, captured automatic Skill activity and exact
final, inspected native injected body/base and DSH lifecycle, proved marker source isolation,
compared state, corrected the prior case's persistence note, and self-reviewed.

## Cases selected

- `cases/CLD-EXT-004--automatic-skill-invocation.md`

## Deviations

None.

## Evidence index

- `evidence/CLD-EXT-004/automatic-skill-evidence.json`
- `evidence/CLD-EXT-004/observations.md`
- `evidence/CLD-EXT-004/final.png`
- `evidence/CLD-EXT-004/review.md`
