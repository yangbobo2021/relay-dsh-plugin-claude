# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk-cli_macos-arm64_ses006

## Environment

- Finished: 2026-08-29 21:03 Asia/Shanghai; operator: Codex deterministic backend-boundary validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code: `0.3.233` / `2.1.233`
- Backends: production `auto` selection, real SDK startup, non-spawning CLI contract probe
- DSH / Node / OS: `0.1.0-rc.8` / `v25.5.0` / macOS arm64

## Configuration

- No model query, settings mutation, Workspace mutation or network prerequisite.
- CLI uses an intentionally nonexistent executable; both unsupported inputs must fail before spawn.
- Live backend identity reuses the already validated `CLD-SES-001` business transcript.

## Commands and actions

1. Ran `probe.mjs` against production plugin/client sources and real installed SDK.
2. Ran `node --test test/cli-client.test.mjs test/sdk-client.test.mjs test/plugin.test.mjs test/dsh-adapter.test.mjs`.
3. Compared the runtime result with native live transcript entrypoint/source and authored the conservative report.

## Cases selected

- `cases/CLD-SES-006--sdk-cli-applicability.md`

## Deviations

- CLI model execution was deliberately not inferred from fake-process argument tests. The report labels it
  contract-tested rather than live end-to-end validated.

## Evidence index

- `probe.mjs`
- `evidence/CLD-SES-006/backend-evidence.json`
- `evidence/CLD-SES-006/focused-tests.md`
- `evidence/CLD-SES-006/observations.md`
- `evidence/CLD-SES-006/review.md`
- `../../reports/backend-applicability.md`
