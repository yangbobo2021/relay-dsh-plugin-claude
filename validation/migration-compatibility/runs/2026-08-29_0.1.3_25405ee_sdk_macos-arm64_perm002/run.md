# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_perm002

## Environment

- Finished: 2026-08-29 21:54 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`

## Configuration

- Production Runtime/SDK with exact Workspace, `workspace-write/on-request`, empty setting sources.
- One sanitized guarded outside file: `/private/tmp/relay-cld-perm002-outside.txt`.

## Commands and actions

Ran fresh deny/allow outside-Read Sessions, captured native approval reason/input/results, checked marker
non-leakage versus exact disclosure, verified file bytes, removed it, hashed transcripts and self-reviewed.

## Cases selected

- `cases/CLD-PERM-002--outside-workspace-access.md`

## Deviations

- None.

## Evidence index

- `probe.mjs`
- `evidence/CLD-PERM-002/permission-evidence.json`
- `evidence/CLD-PERM-002/observations.md`
- `evidence/CLD-PERM-002/review.md`
