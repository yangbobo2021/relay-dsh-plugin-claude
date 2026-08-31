# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_img009

## Environment

- Finished: 2026-08-29 17:06 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec/fixture artifact additions only; product source unchanged

## Configuration

- Isolated DSH/link environment `/private/tmp/relay-cld-live002.p2EkK4/`
- Image-output Workspace with precommitted safe 240x160 inline-only SVG fixture
- Two fresh Standard/Claude Sonnet/Medium/Workspace Write Sessions

## Commands and actions

Ran three focused SVG conversion/safety tests, scanned the fixture for unsafe references,
then made two independent zero-tool model turns return the identical SVG path. Decoded
the promoted object, sampled its pixels, compared object sets after each run, correlated
both DSH/link/native records, and captured both rendered Sessions before self-review.

## Cases selected

- `cases/CLD-IMG-009--svg-output-conversion.md`

## Deviations

The first safety-scan command used an incorrect working directory and failed before
reading the fixture. It was immediately rerun against the correct path; the retained
result reports zero unsafe references. No model turn depended on the failed command.

## Evidence index

- `evidence/CLD-IMG-009/svg-evidence.json`
- `evidence/CLD-IMG-009/observations.md`
- `evidence/CLD-IMG-009/trial-a.png`
- `evidence/CLD-IMG-009/trial-b.png`
- `evidence/CLD-IMG-009/review.md`
