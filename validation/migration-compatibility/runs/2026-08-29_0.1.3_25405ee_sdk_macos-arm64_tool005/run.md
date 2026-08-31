# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_tool005

## Environment

- Finished: 2026-08-29 17:36 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec/fixture artifact additions only; product source unchanged

## Configuration

- Isolated DSH/link environment `/private/tmp/relay-cld-live002.p2EkK4/`
- Dedicated tool Workspace with precommitted one-line edit fixture
- Fresh Standard/Claude Sonnet/Medium/Workspace Write Session; on-request approval

## Commands and actions

Captured all before hashes, requested exact Edit while initially prohibiting every other
file tool, observed one unrequested read-only Read preflight, allowed the exact Edit once,
verified file bytes/hash and complete Workspace scope, inspected native/DSH state, corrected
the over-strict case criterion during self-review, and retained the prompt deviation.

## Cases selected

- `cases/CLD-TOOL-005--edit-one-line.md`

## Deviations

Claude used Read before Edit despite the prompt prohibiting other file tools. Self-review
found that treating a non-mutating safety preflight as failure would not answer the atomic
Edit capability. The case now explicitly permits optional Read while still forbidding any
alternate mutation; the observed deviation remains recorded rather than hidden.

## Evidence index

- `evidence/CLD-TOOL-005/edit-evidence.json`
- `evidence/CLD-TOOL-005/observations.md`
- `evidence/CLD-TOOL-005/final.png`
- `evidence/CLD-TOOL-005/review.md`
