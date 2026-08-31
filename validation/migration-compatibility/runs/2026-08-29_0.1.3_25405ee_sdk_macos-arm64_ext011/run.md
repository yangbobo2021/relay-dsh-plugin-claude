# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_ext011

## Environment

- Finished: 2026-08-29 19:08 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK runtime / install CLI / backend: Claude Code `2.1.233` / `2.1.248` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec artifact additions only; product source unchanged

## Configuration

- User-scoped CLI installation from the immutable local validation marketplace
- Plugin ID: `relay-cld-installed-fixture@relay-cld-validation-marketplace`
- Fresh tool-workspace Claude Sonnet/Medium/Workspace Write Session

## Commands and actions

Recorded exact user plugin/settings baselines; validated the local marketplace and plugin; added the
marketplace and installed the plugin through Claude CLI; checked CLI JSON/details and cache digests;
submitted one unrelated no-tool DSH probe; inspected business and auxiliary initial SDK Skill
listings; compared native/DSH/UI/state evidence; self-reviewed namespace and prompt independence;
then uninstalled, removed the marketplace, and restored all user plugin/settings bytes and paths.

## Cases selected

- `cases/CLD-EXT-011--installed-plugin-discovery.md`

## Deviations

- The currently available management CLI is Claude Code `2.1.248`, while the already-running SDK
  process records Claude Code `2.1.233`. This is retained as an environment fact; the older SDK
  process consumes the CLI-created install successfully, which directly tests compatibility.
- The user control is an existing built-in/user Skill (`dataviz`) because the temporary EXT-001
  fixture is no longer installed. The project control remains `relay-cld-project-skill`.
- Claude CLI uninstall intentionally leaves an empty registry and orphaned cache. The case removes
  only those fixture-created artifacts and restores the pre-run settings/marketplace bytes exactly.

## Evidence index

- `evidence/CLD-EXT-011/installed-discovery-evidence.json`
- `evidence/CLD-EXT-011/observations.md`
- `evidence/CLD-EXT-011/unrelated-probe.png`
- `evidence/CLD-EXT-011/review.md`
