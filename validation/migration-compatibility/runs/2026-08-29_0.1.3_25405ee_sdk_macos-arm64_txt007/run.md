# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_txt007

## Environment

- Finished: 2026-08-29 16:15 Asia/Shanghai; operator: Codex synchronized Web validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec untracked; product source unchanged

## Configuration

- Isolated DSH/link environment `/private/tmp/relay-cld-live002.p2EkK4/`
- Standard authenticated Claude root, not inspected; Claude Haiku/Low, Workspace Write

## Commands and actions

Sent a 1,000-line derived-marker response request, polled at 100ms, clicked Stop on the
first begin-visible/active/end-absent sample, observed through 12 seconds, inspected the
aborted archive, then completed an exact recovery turn in the same Session.

## Cases selected

- `cases/CLD-TXT-007--stop-generation.md`

## Deviations

- Claude reasoning inferred the requested end-marker string before interruption. The
  case result is scoped to terminal assistant text/output: the end marker never enters a
  `text` block or visible answer paragraph. This boundary is retained explicitly.

## Evidence index

- `evidence/CLD-TXT-007/interruption.json`
- `evidence/CLD-TXT-007/observations.md`
- `evidence/CLD-TXT-007/stopped.png`
- `evidence/CLD-TXT-007/recovered.png`
- `evidence/CLD-TXT-007/review.md`
