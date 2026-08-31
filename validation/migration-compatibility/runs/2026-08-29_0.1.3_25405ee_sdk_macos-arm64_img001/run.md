# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_img001

## Environment

- Finished: 2026-08-29 16:36 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec/fixture additions only; product source unchanged

## Configuration

- Isolated DSH/link environment `/private/tmp/relay-cld-live002.p2EkK4/`
- Image fixture Workspace / Claude Sonnet Medium / Workspace Write / on-request
- Deterministic 640×480 PNG rendered from retained SVG source

## Commands and actions

Rendered and fingerprinted a text-free visual fixture, pasted exactly one PNG into the
DSH composer, sent a rigid visual-observation prompt, and correlated UI, DSH attachment
storage/archive, Relay link/replay state, and exact native Claude content. Self-review
found an open-vocabulary `PALE_YELLOW` versus `YELLOW` expectation mismatch in the first
trial, so a fresh closed-vocabulary trial repeated the complete validation before closure.

## Cases selected

- `cases/CLD-IMG-001--single-image-understanding.md`

## Deviations

- The first result was semantically correct but not used for the pass because the test's
  shade vocabulary was ambiguous. The decisive rerun used a predeclared basic-color enum.

## Evidence index

- `evidence/CLD-IMG-001/image-evidence.json`
- `evidence/CLD-IMG-001/observations.md`
- `evidence/CLD-IMG-001/composer-one-image.png`
- `evidence/CLD-IMG-001/completed.png`
- `evidence/CLD-IMG-001/retry-composer-one-image.png`
- `evidence/CLD-IMG-001/retry-completed.png`
- `evidence/CLD-IMG-001/review.md`
