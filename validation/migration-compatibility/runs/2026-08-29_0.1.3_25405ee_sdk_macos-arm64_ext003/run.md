# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_ext003

## Environment

- Finished: 2026-08-29 18:25 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec artifact additions only; product source unchanged

## Configuration

- Previously verified immutable user Skill `relay-cld-user-skill`
- Tool-workspace business listing contains user and project fixtures
- Fresh Claude Sonnet/Medium/Workspace Write Session

## Commands and actions

Required one explicit Skill invocation without placing its result marker in the prompt, captured the
exact final, inspected native listing/tool/result and DSH lifecycle, proved marker source isolation,
inspected the post-tool injected Skill context, compared state, and self-reviewed.

## Cases selected

- `cases/CLD-EXT-003--manual-skill-invocation.md`

## Deviations

- Initial inspection looked only at tool results and attachments and therefore missed the loaded
  body. A deeper review found the exact base directory and Skill body persisted as a post-tool user
  context message. The record was corrected before later requirements were closed.

## Evidence index

- `evidence/CLD-EXT-003/manual-skill-evidence.json`
- `evidence/CLD-EXT-003/observations.md`
- `evidence/CLD-EXT-003/final.png`
- `evidence/CLD-EXT-003/review.md`
