# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_perm003

## Environment

- Finished: 2026-08-29 21:57 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`

## Configuration

- Production Runtime/SDK; `sandbox: read-only`, `approvalPolicy: on-request`, empty settings.

## Commands and actions

Requested one exact Read then an exact Write attempt, captured native query mode/tools/terminal state,
checked absent target at completion and after 2s, verified read digest, cleaned defensively and self-reviewed.

## Cases selected

- `cases/CLD-PERM-003--plan-readonly-mode.md`

## Deviations

- Final includes a short native Plan-mode explanation before the requested exact end marker.

## Evidence index

- `probe.mjs`
- `evidence/CLD-PERM-003/permission-evidence.json`
- `evidence/CLD-PERM-003/observations.md`
- `evidence/CLD-PERM-003/review.md`
