# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_ext019

## Environment

- Finished: 2026-08-29 19:46 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec artifact additions only; product source unchanged

## Configuration

- Production `ClaudeSdkClient`, real installed SDK and its Relay `2.1.233` executable
- One fresh Session, two sequential Sonnet/Medium turns, `settingSources: []`, permission `dontAsk`
- Turn 1 DSH schema set: only `refresh_alpha`; turn 2: only `refresh_beta`

## Commands and actions

Created one read-only probe around the real SDK's `createSdkMcpServer` and `query` entry points; ran
two turns on one Session; recorded registrations, allowed tools, resume identity, structured native
activities, handler calls/results/finals and transcript; compared source/config/object/Git invariants;
self-reviewed direct always-loaded semantics and the initially invalid executable-path attempt.

## Cases selected

- `cases/CLD-EXT-019--dynamic-dsh-tool-refresh.md`

## Deviations

- The first attempt used SDK auto-resolution and both turns failed before model start because the
  executable could not launch through that path. It is excluded from capability judgment. Supplying
  the exact Relay `2.1.233` executable produced the valid run; the probe now records that path.
- `alwaysLoad: true` makes contributed DSH tools directly available, so ToolSearch returns no deferred
  reference for both present tools. Registration/allowed-tool snapshots and successful direct calls,
  not ToolSearch discovery, prove the active set. Removed alpha also has no turn-2 call or handler hit.
- The SDK wrapper only clones metadata before delegating unchanged to the real SDK.

## Evidence index

- `probe.mjs`
- `evidence/CLD-EXT-019/dynamic-refresh-evidence.json`
- `evidence/CLD-EXT-019/observations.md`
- `evidence/CLD-EXT-019/review.md`
