# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_tool010

## Environment

- Finished: 2026-08-29 17:59 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec/fixture artifact additions only; product source unchanged

## Configuration

- Isolated DSH/link environment `/private/tmp/relay-cld-live002.p2EkK4/`
- Dedicated tool Workspace; fresh Claude Sonnet/Medium/Workspace Write Session
- Immediate started-file proof followed by a 15-second delayed output/file branch

## Commands and actions

Captured exact baselines, allowed one Bash, polled until its immediate started file existed,
pressed Stop once 303ms later, waited 18.797 seconds, checked UI/native/DSH/process/file/object
state, and self-reviewed.

## Cases selected

- `cases/CLD-TOOL-010--bash-interruption.md`

## Deviations

- An initial attempt observed the tool row before its approval was granted and therefore could
  not prove execution had started. It produced no target file and is excluded.
- Self-review added an immediate started-file oracle. The deciding fresh Session proves the
  process crossed that oracle before Stop; only this second run determines the result.

## Evidence index

- `evidence/CLD-TOOL-010/interruption-evidence.json`
- `evidence/CLD-TOOL-010/observations.md`
- `evidence/CLD-TOOL-010/stopped.png`
- `evidence/CLD-TOOL-010/post-deadline.png`
- `evidence/CLD-TOOL-010/review.md`
- `evidence/CLD-TOOL-010/running-before-stop.png` — excluded initial approval-pending trial
