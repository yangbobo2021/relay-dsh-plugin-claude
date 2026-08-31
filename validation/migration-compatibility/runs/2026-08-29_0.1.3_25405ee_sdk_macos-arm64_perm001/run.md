# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_perm001

## Environment

- Finished: 2026-08-29 21:51 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`

## Configuration

- Production Runtime + SDK client; exact cwd; `workspace-write`, `on-request`, empty setting sources.

## Commands and actions

Ran isolated allow/deny Sessions, accepted/declined exact Write requests, verified Read and file bytes,
captured SDK permission mode/native transcripts, removed both targets and self-reviewed policy enforcement.

## Cases selected

- `cases/CLD-PERM-001--workspace-policy.md`

## Deviations

- Read was allowed by Claude without an interactive request; both mutating Writes requested approval.

## Evidence index

- `probe.mjs`
- `evidence/CLD-PERM-001/permission-evidence.json`
- `evidence/CLD-PERM-001/observations.md`
- `evidence/CLD-PERM-001/review.md`
