# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_file002

## Environment

- Finished: 2026-08-29 17:22 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec/fixture artifact additions only; product source unchanged

## Configuration

- Isolated DSH/link environment `/private/tmp/relay-cld-live002.p2EkK4/`
- Valid one-page PDF fixture outside selected image-output Workspace
- Fresh Standard/Claude Sonnet/Medium/Workspace Write composer

## Commands and actions

Created the PDF under the PDF skill's artifact contract, extracted and rendered it with
the bundled runtime, visually inspected the rendered page, then pasted the exact PDF as an
`application/pdf` file item. Sampled the transient rejection, tested recovery draft input
without sending, compared all state, checked marker leakage and Host output, and reviewed
support classification.

## Cases selected

- `cases/CLD-FILE-002--document-attachment.md`

## Deviations

- The first PDF operation-marker invocation used the repository as cwd and failed because
  the bundled script was not there. It created no artifact. The script was located in the
  PDF runtime, invoked successfully exactly once, and only then was the PDF authored.
- The marker-read model prompt was not sent because PDF rejection occurred pre-SDK.

## Evidence index

- `evidence/CLD-FILE-002/document-evidence.json`
- `evidence/CLD-FILE-002/observations.md`
- `evidence/CLD-FILE-002/fixture-render.png`
- `evidence/CLD-FILE-002/explicit-rejection-clean.png`
- `evidence/CLD-FILE-002/pdf-paste-result.png`
- `evidence/CLD-FILE-002/review.md`
