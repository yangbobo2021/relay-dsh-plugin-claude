# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_tool001

## Environment

- Finished: 2026-08-29 17:25 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec/fixture artifact additions only; product source unchanged

## Configuration

- Isolated DSH/link environment `/private/tmp/relay-cld-live002.p2EkK4/`
- Newly registered sanitized `fixtures/tool-workspace`
- Fresh Standard/Claude Sonnet/Medium/Workspace Write Session

## Commands and actions

Registered the dedicated Workspace through DSH, selected Claude after the registration
reset, captured file/native/object baselines, sent one forced `pwd` task, observed the Bash
activity and exact final, compared all cwd surfaces, captured the UI, and self-reviewed.

## Cases selected

- `cases/CLD-TOOL-001--workspace-cwd.md`

## Deviations

None. Read-only `pwd` required no approval.

## Evidence index

- `evidence/CLD-TOOL-001/cwd-evidence.json`
- `evidence/CLD-TOOL-001/observations.md`
- `evidence/CLD-TOOL-001/final.png`
- `evidence/CLD-TOOL-001/review.md`
