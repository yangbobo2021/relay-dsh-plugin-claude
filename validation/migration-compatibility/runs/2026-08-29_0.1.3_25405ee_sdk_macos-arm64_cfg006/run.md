# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_cfg006

## Environment

- Finished: 2026-08-29 20:09 Asia/Shanghai; operator: Codex protocol + live/component validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64

## Configuration

- Project settings conflict as Haiku / Low / Plan
- Live explicit Relay query: Sonnet / Medium / workspace-write+on-request / exact fixture cwd
- Adapter probe DSH state: Sonnet / High / read-only+never / exact agent-header cwd

## Commands and actions

Ran a production-client real SDK query under conflicting settings; captured query options and native
actual model/effort/permission/cwd; independently exercised production adapter mapping from DSH model,
reasoning and permission events; hashed source/fixture/transcript/state; self-reviewed evidence layers.

## Cases selected

- `cases/CLD-CFG-006--dsh-owned-setting-collision.md`

## Deviations

- First adapter probe tried to clone its execution callback and failed before completion. The recorder
  was corrected to omit the function body and retain its type; only the successful rerun is judged.

## Evidence index

- `live-probe.mjs`
- `adapter-probe.mjs`
- `evidence/CLD-CFG-006/ownership-evidence.json`
- `evidence/CLD-CFG-006/observations.md`
- `evidence/CLD-CFG-006/review.md`
