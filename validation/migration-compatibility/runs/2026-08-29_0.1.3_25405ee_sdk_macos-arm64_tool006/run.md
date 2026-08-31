# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_tool006

## Environment

- Finished: 2026-08-29 17:39 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec/fixture artifact additions only; product source unchanged

## Configuration

- Isolated DSH/link environment `/private/tmp/relay-cld-live002.p2EkK4/`
- Dedicated tool Workspace with two precommitted multi-edit fixtures
- Fresh Standard/Claude Sonnet/Medium/Workspace Write Session; on-request approvals

## Commands and actions

Captured seven-file Workspace hashes, requested both exact edits in one task, observed two
allowed Read preflights and two overlapping Edit requests, allowed each Edit once in order,
captured the completed final, verified both after digests and the global Workspace/object
scope, inspected native/DSH approval/activity, and self-reviewed.

## Cases selected

- `cases/CLD-TOOL-006--multi-file-edit.md`

## Deviations

None. Optional Read preflights were permitted by the case.

## Evidence index

- `evidence/CLD-TOOL-006/multi-edit-evidence.json`
- `evidence/CLD-TOOL-006/observations.md`
- `evidence/CLD-TOOL-006/final.png`
- `evidence/CLD-TOOL-006/review.md`
