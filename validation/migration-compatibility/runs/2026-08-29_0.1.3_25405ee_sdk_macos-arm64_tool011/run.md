# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_tool011

## Environment

- Finished: 2026-08-29 18:02 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec/fixture artifact additions only; product source unchanged

## Configuration

- Isolated DSH/link environment `/private/tmp/relay-cld-live002.p2EkK4/`
- Dedicated tool Workspace; fresh Claude Sonnet/Medium/Workspace Write Session
- Calibrated Node test fixture with one intentional pass and one intentional failure

## Commands and actions

Calibrated the exact test command independently, captured state, required one exact Bash,
allowed it once, captured the exact interpretation, inspected native/DSH error output and turn
completion, compared every Workspace/object digest, and self-reviewed.

## Cases selected

- `cases/CLD-TOOL-011--test-execution.md`

## Deviations

- The first calibration wrapper used zsh's read-only `status` name after the test command; the
  fixture itself ran, but the wrapper stopped. Calibration was rerun with a task-specific variable.
- Host `shasum` required `LC_ALL=C`; the digest was then captured successfully. Neither issue
  affected the clean Claude Session or changed the fixture.

## Evidence index

- `evidence/CLD-TOOL-011/test-execution-evidence.json`
- `evidence/CLD-TOOL-011/observations.md`
- `evidence/CLD-TOOL-011/final.png`
- `evidence/CLD-TOOL-011/review.md`
