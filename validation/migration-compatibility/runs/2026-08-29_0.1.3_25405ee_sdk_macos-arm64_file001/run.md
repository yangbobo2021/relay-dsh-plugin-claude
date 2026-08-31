# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_file001

## Environment

- Finished: 2026-08-29 17:16 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec/fixture artifact additions only; product source unchanged

## Configuration

- Isolated DSH/link environment `/private/tmp/relay-cld-live002.p2EkK4/`
- Text fixture outside selected image-output Workspace
- Fresh Standard/Claude Sonnet/Medium/Workspace Write composer

## Commands and actions

Inspected visible and hidden composer controls, opened and captured the complete command
palette, pasted the fixture as a `text/plain` clipboard file item without sending, checked
the installed DSH client implementation/send contract, compared native/link/object/Session
state, searched for marker leakage, polled Host output, and self-reviewed classification.

## Cases selected

- `cases/CLD-FILE-001--text-source-attachment.md`

## Deviations

The required model prompt was intentionally not sent because DSH could not construct a
text-file draft attachment. Sending the prompt without an attachment could only create a
false negative model answer and would not test transport.

## Evidence index

- `evidence/CLD-FILE-001/live.md`
- `evidence/CLD-FILE-001/static-ui-boundary.md`
- `evidence/CLD-FILE-001/no-file-control.png`
- `evidence/CLD-FILE-001/text-file-paste.png`
- `evidence/CLD-FILE-001/review.md`
