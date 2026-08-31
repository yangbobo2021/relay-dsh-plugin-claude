# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_img002

## Environment

- Finished: 2026-08-29 16:42 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec/fixture additions only; product source unchanged

## Configuration

- Isolated DSH/link environment `/private/tmp/relay-cld-live002.p2EkK4/`
- Image fixture Workspace / Claude Sonnet Medium / Workspace Write / on-request
- Deterministic 900×420 high-contrast OCR PNG rendered from retained SVG

## Commands and actions

Ran two identical third-line trials on an instruction-like image, confirmed both images
reached native Claude intact despite `NO_IMAGE` finals, then ran an all-lines diagnostic
that succeeded and exposed prompt-injection reasoning. Self-review removed instruction
semantics from the fixture, regenerated/fingerprinted it, and completed a fresh formal
all-lines OCR trial with full DSH/link/native correlation.

## Cases selected

- `cases/CLD-IMG-002--image-ocr.md`

## Deviations

- The original fixture's line `READ THIRD LINE` confounded OCR with image prompt-injection
  defenses. Those trials are retained as a product behavior boundary; the final fixture
  uses neutral labels and keeps the same unique target marker.

## Evidence index

- `evidence/CLD-IMG-002/ocr-evidence.json`
- `evidence/CLD-IMG-002/observations.md`
- `evidence/CLD-IMG-002/completed.png`
- `evidence/CLD-IMG-002/trial2-completed.png`
- `evidence/CLD-IMG-002/trial3-completed.png`
- `evidence/CLD-IMG-002/formal-composer-one-image.png`
- `evidence/CLD-IMG-002/formal-completed.png`
- `evidence/CLD-IMG-002/review.md`
