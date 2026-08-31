# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_ext018

## Environment

- Finished: 2026-08-29 19:39 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec artifact additions only; product source unchanged

## Configuration

- No fixture plugin/MCP installation or user/project extension configuration
- One fresh tool-workspace Claude Sonnet/Medium/Workspace Write Session
- Read-only, no-argument DSH `CronList` schema advertised to Relay

## Commands and actions

Recorded state baselines; selected read-only `CronList` from the initial DSH-contributed tool delta;
ran one exact selector and one no-argument call; inspected native reference/call/result, DSH execution
lifecycle/result/final, UI, SDK bridge implementation digest, and Workspace/object/Git/source state;
self-reviewed the empty-list result and prompt-derived classification separately.

## Cases selected

- `cases/CLD-EXT-018--dsh-contributed-tool.md`

## Deviations

- Claude's native transcript and DSH UI expose the contributed tool as `CronList`, while Relay's SDK
  implementation registers/allowlists it internally as `mcp__dsh__CronList`. The live reference and
  execution use the public advertised name; the implementation digest establishes the MCP bridge.
- The exact final success marker is prompt-supplied and is used only as continuity/classification
  evidence. The real capability proof is the structured advertised reference and exact non-error
  result `No scheduled jobs.` in native and DSH records.

## Evidence index

- `evidence/CLD-EXT-018/dsh-tool-evidence.json`
- `evidence/CLD-EXT-018/observations.md`
- `evidence/CLD-EXT-018/cron-list-final.png`
- `evidence/CLD-EXT-018/review.md`
