# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_txt002

## Environment

- Started / finished: 2026-08-29 15:59 Asia/Shanghai
- Operator or automation: Codex live DSH Web validation
- Plugin version / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- Repository state: validation/spec directories untracked; product source unchanged
- Claude Agent SDK / executable: `0.3.233` / Claude Code `2.1.233`
- Active backend: `sdk`
- DSH: official packaged `0.1.0-rc.8`; packaged commit not exposed
- Node.js / OS / architecture: `v25.5.0` / macOS `15.3.1` / `arm64`
- Browser: in-app Chromium through isolated DSH Web port `4394`
- Fixture manifest SHA-256:
  `b68ece075dc2bdc11492d8a446a20d09dcb1ac3016b573fa28e8343a3322c953`

## Configuration

- DSH/link environment: `/private/tmp/relay-cld-live002.p2EkK4/`
- Claude configuration: standard authenticated root, not inspected or retained
- Setting sources: `user`, `project`, `local`; fixture has no project/local Claude config
- Model / effort / permission: `haiku` / `low` / Workspace Write + on-request

## Commands and actions

1. Recorded the one-link baseline and Workspace/session path-set digests.
2. Created a fresh visible DSH Session and selected Claude Code, Haiku, Low.
3. Sent `请仅回复以下标记，不要调用工具：CLD_TXT002_中文_🚀_1002`.
4. Compared the final archive bytes to an independent UTF-8/code-point oracle and
   visually reviewed the completed UI.

## Cases selected

- `cases/CLD-TXT-002--chinese-unicode-round-trip.md` (`CLD-TXT-002`)

## Deviations

None.

## Evidence index

- `evidence/CLD-TXT-002/oracle.json`
- `evidence/CLD-TXT-002/link-summary.json`
- `evidence/CLD-TXT-002/archive-summary.json`
- `evidence/CLD-TXT-002/observations.md`
- `evidence/CLD-TXT-002/completed-turn.png`
- `evidence/CLD-TXT-002/review.md`
