# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_txt003

## Environment

- Started / finished: 2026-08-29 16:01 Asia/Shanghai
- Operator: Codex live DSH Web validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- Agent SDK / Claude Code: `0.3.233` / `2.1.233`; backend `sdk`
- DSH / Node / OS: official `0.1.0-rc.8` / `v25.5.0` / macOS `15.3.1 arm64`
- Repository state: validation/spec directories untracked; product source unchanged
- Fixture manifest: `b68ece075dc2bdc11492d8a446a20d09dcb1ac3016b573fa28e8343a3322c953`

## Configuration

- Isolated DSH/link environment: `/private/tmp/relay-cld-live002.p2EkK4/`
- Standard authenticated Claude root; contents not inspected or retained
- Setting sources `user,project,local`; no fixture project/local Claude config
- Claude Haiku / Low / Workspace Write / on-request

## Commands and actions

Created a fresh Claude Code Session, sent the fixed Markdown payload request, then
compared the single terminal text block to the exact oracle and inspected H1/list/code
DOM semantics plus the original-resolution screenshot.

## Cases selected

- `cases/CLD-TXT-003--markdown-code-rendering.md`

## Deviations

None.

## Evidence index

- `evidence/CLD-TXT-003/structure.json`
- `evidence/CLD-TXT-003/observations.md`
- `evidence/CLD-TXT-003/completed-turn.png`
- `evidence/CLD-TXT-003/review.md`
