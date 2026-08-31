# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_ext014

## Environment

- Finished: 2026-08-29 19:21 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- Install CLI / DSH / platform: Claude Code `2.1.248` / official `0.1.0-rc.8` / macOS arm64
- Repository state: validation/spec artifact additions only; product source unchanged

## Configuration

- User-scoped CLI install of fixture plugin `1.0.2` with one no-tool Haiku Agent
- One fresh tool-workspace Claude Sonnet/Medium/Workspace Write parent Session

## Commands and actions

Recorded exact baselines; validated and installed the immutable fixture; checked CLI Agent inventory;
submitted one exact foreground namespaced Agent request; captured initial listing, native parent
call/result, depth-1 child transcript/meta, model/cwd/attribution/tool counts, DSH lifecycle/final, and
UI/state/source evidence; self-reviewed child identity and result propagation; then uninstalled and
restored all user configuration/cache paths and baseline bytes.

## Cases selected

- `cases/CLD-EXT-014--plugin-agent.md`

## Deviations

- The initial listing renders `(Tools: All tools)` even though the Agent frontmatter contains
  `tools: []`. The decisive child transcript records zero actual tool uses as required; the listing
  label is retained as a presentation/config-interpretation gap but does not mask execution behavior.

## Evidence index

- `evidence/CLD-EXT-014/plugin-agent-evidence.json`
- `evidence/CLD-EXT-014/observations.md`
- `evidence/CLD-EXT-014/agent-final.png`
- `evidence/CLD-EXT-014/review.md`
