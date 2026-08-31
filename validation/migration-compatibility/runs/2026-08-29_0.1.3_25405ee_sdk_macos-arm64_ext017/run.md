# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_ext017

## Environment

- Finished: 2026-08-29 19:36 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- Install CLI / DSH / platform: Claude Code `2.1.248` / official `0.1.0-rc.8` / macOS arm64
- Repository state: validation/spec artifact additions only; product source unchanged

## Configuration

- Two user-scoped CLI installs from two independent local marketplace directories
- Both plugins intentionally define the same `installed-discovery` Skill basename
- One fresh tool-workspace Claude Sonnet/Medium/Workspace Write Session

## Commands and actions

Recorded exact user/state baselines; validated/added both marketplaces and installed both plugins;
checked two enabled CLI entries and installed digests; ran one fresh dual-namespace Session with two
ordered Skill calls; inspected initial listing, exact calls/results, each meta body/base/tool ID,
native attribution, DSH activities/final, UI/source/state evidence; self-reviewed collision/order and
single-field attribution; then uninstalled both and restored every user byte/path.

## Cases selected

- `cases/CLD-EXT-017--multiple-plugin-sources.md`

## Deviations

- Native final assistant records only one `attributionSkill`/`attributionPlugin`, corresponding to the
  last loaded Skill. Per-call provenance remains unambiguous through each distinct Tool call ID,
  injected meta body, base directory, and launch result. This is a single-final-attribution limitation,
  not a namespace collision.

## Evidence index

- `evidence/CLD-EXT-017/multiple-sources-evidence.json`
- `evidence/CLD-EXT-017/observations.md`
- `evidence/CLD-EXT-017/dual-plugin-final.png`
- `evidence/CLD-EXT-017/review.md`
