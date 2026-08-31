# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_ext013

## Environment

- Finished: 2026-08-29 19:17 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- Install CLI / DSH / platform: Claude Code `2.1.248` / official `0.1.0-rc.8` / macOS arm64
- Repository state: validation/spec artifact additions only; product source unchanged

## Configuration

- User-scoped CLI install of fixture plugin `1.0.1` with one Skill and one legacy command
- Two independent fresh tool-workspace Claude Sonnet/Medium/Workspace Write Sessions

## Commands and actions

Recorded exact user/state baselines; validated and installed the immutable plugin; required CLI
inventory of both components; ran one namespaced Skill invocation and one namespaced command
invocation in separate Sessions; inspected initial listings, exact native calls, injected meta bodies,
attribution, DSH activities/finals, UI/state/source evidence; self-reviewed separation and marker
provenance; then uninstalled and restored every fixture-created user path and exact baseline bytes.

## Cases selected

- `cases/CLD-EXT-013--plugin-skill-command.md`

## Deviations

- Claude exposes both modern Skills and legacy `commands/*.md` through the same built-in `Skill`
  tool. Component identity is therefore proven by its namespaced argument, injected body, and native
  `attributionSkill`/`attributionPlugin`, not by expecting a distinct command tool name.
- The discovery Skill's retained body marker is named for EXT-011. It is absent from the EXT-013
  prompt and injected only after the exact namespaced call, so it remains a valid provenance oracle.

## Evidence index

- `evidence/CLD-EXT-013/plugin-invocation-evidence.json`
- `evidence/CLD-EXT-013/observations.md`
- `evidence/CLD-EXT-013/skill-final.png`
- `evidence/CLD-EXT-013/command-final.png`
- `evidence/CLD-EXT-013/review.md`
