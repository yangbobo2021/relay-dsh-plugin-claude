# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_perm004

## Environment

- Finished: 2026-08-29 22:02 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`

## Configuration

- Production Runtime/SDK, `workspace-write/on-request`; guarded project deny for exact DSH MCP and Agent.

## Commands and actions

Ran independent MCP and Agent allow controls plus project-denied counterparts, captured callback/child/tool
oracles, SDK allowlist/settings/requests, restored settings, hashed parent/child transcripts and self-reviewed.

## Cases selected

- `cases/CLD-PERM-004--extension-permissions.md`

## Deviations

- The denied MCP result is normalized twice with one identical tool ID; one native call has zero callbacks.
- Agent deny branch performs one read-only ToolSearch after Agent is removed, then stops as instructed.

## Evidence index

- `probe.mjs`, `project-settings.json`
- `evidence/CLD-PERM-004/permission-evidence.json`
- `evidence/CLD-PERM-004/observations.md`
- `evidence/CLD-PERM-004/review.md`
