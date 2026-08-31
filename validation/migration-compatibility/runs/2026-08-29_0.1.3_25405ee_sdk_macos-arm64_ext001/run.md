# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_ext001

## Environment

- Finished: 2026-08-29 18:19 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec/fixture artifact additions only; product source unchanged

## Configuration

- User fixture installed at `~/.claude/skills/relay-cld-user-skill/`
- Byte-identical canonical fixture under `fixtures/extensions/user-skill/`
- Dedicated tool Workspace; fresh Claude Sonnet/Medium/Workspace Write Session

## Commands and actions

Proved prior listing absence, installed and hashed the global/canonical fixture, ran an unrelated
no-tool probe in a fresh Session, inspected initial skill listings for business and auxiliary
native Sessions, checked DSH completion/link/state, and self-reviewed.

## Cases selected

- `cases/CLD-EXT-001--user-skill-discovery.md`

## Deviations

- The sanitized user fixture remains intentionally installed through `CLD-EXT-005` so subsequent
  manual, automatic, and bundled-resource cases test the same immutable bytes. Cleanup is deferred
  and will be recorded there.

## Evidence index

- `evidence/CLD-EXT-001/user-skill-discovery-evidence.json`
- `evidence/CLD-EXT-001/observations.md`
- `evidence/CLD-EXT-001/final.png`
- `evidence/CLD-EXT-001/review.md`
