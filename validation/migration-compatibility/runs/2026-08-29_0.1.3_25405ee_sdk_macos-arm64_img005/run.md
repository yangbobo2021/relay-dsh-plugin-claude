# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_img005

## Environment

- Finished: 2026-08-29 16:53 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec/fixture additions only; product source unchanged

## Configuration

- Isolated DSH/link environment `/private/tmp/relay-cld-live002.p2EkK4/`
- Image fixture Workspace / Claude Sonnet Medium / Workspace Write / on-request
- Corrupt 23-byte payload presented to clipboard as `image/png`

## Commands and actions

Ran focused SDK and DSH-adapter zero-query tests, snapshotted link/native/DSH/object sets,
pasted and submitted the corrupt PNG payload, captured DSH's rejection, then audited all
sets and the exact newly created empty DSH Session archive before self-review.

## Cases selected

- `cases/CLD-IMG-005--invalid-image-rejection.md`

## Deviations

- Validation occurs on submit, not paste: a temporary preview remains after rejection.
- DSH creates an empty configuration-only Session shell before attachment validation.

## Evidence index

- `evidence/CLD-IMG-005/rejection-evidence.json`
- `evidence/CLD-IMG-005/observations.md`
- `evidence/CLD-IMG-005/rejected.png`
- `evidence/CLD-IMG-005/review.md`
