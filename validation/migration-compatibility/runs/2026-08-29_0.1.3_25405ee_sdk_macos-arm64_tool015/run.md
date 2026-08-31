# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_tool015

## Environment

- Finished: 2026-08-29 18:13 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec/fixture artifact additions only; product source unchanged

## Configuration

- Isolated DSH/link environment `/private/tmp/relay-cld-live002.p2EkK4/`
- Dedicated tool Workspace; two fresh Claude Sonnet/Medium/Workspace Write Sessions
- Separate exact Bash write targets for allow-once and reject branches

## Commands and actions

Captured baselines; ran and approved the allow branch; verified exact bytes/final; ran the deny
branch; proved target absence before decision, rejected once, waited for completion plus safety
interval, verified continued absence; inspected both native/DSH/link/state records; self-reviewed.

## Cases selected

- `cases/CLD-TOOL-015--tool-approval.md`

## Deviations

None.

## Evidence index

- `evidence/CLD-TOOL-015/tool-approval-evidence.json`
- `evidence/CLD-TOOL-015/observations.md`
- `evidence/CLD-TOOL-015/allow-final.png`
- `evidence/CLD-TOOL-015/deny-pending.png`
- `evidence/CLD-TOOL-015/deny-final.png`
- `evidence/CLD-TOOL-015/review.md`
