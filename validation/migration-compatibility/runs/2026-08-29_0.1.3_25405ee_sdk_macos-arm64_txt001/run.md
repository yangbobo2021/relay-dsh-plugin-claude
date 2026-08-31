# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_txt001

## Environment

- Started / finished: 2026-08-29 15:55 Asia/Shanghai
- Operator or automation: Codex live DSH Web validation
- Plugin version / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- Repository state: validation/spec directories untracked; product source unchanged
- Claude Agent SDK version: `0.3.233`
- Claude Code executable version: `2.1.233`
- Active backend: `sdk`
- DSH version / distribution: official packaged `0.1.0-rc.8`; packaged commit not exposed
- Node.js / OS / architecture: `v25.5.0` / macOS `15.3.1` / `arm64`
- Browser: in-app Chromium through DSH Web at isolated loopback port `4394`
- Fixture digest: `workspace.txt` SHA-256
  `5128c2e7d026a428d190b7341a15ebbb1ffc2bdd5f540f115731768216fd3a55`

## Configuration

- Isolated DSH home/link store: `/private/tmp/relay-cld-live002.p2EkK4/`; retained
  evidence contains no credential material.
- Claude configuration root: standard authenticated Claude Code root with
  `CLAUDE_CONFIG_DIR` unset; files/credentials were not read or copied.
- Active setting sources: `user`, `project`, `local`; fixture contains no project/local
  Claude settings or instructions.
- Explicit plugin path: local checkout `integrations/claude`; no Claude plugins specified.
- Model / effort / permission mode: `haiku` / `low` / Workspace Write + on-request.
- Network/account prerequisites: live authenticated Claude service available.

## Commands and actions

1. Initialized a fresh official DSH Web Profile and added the local Claude plugin.
2. Started DSH with a dedicated link store and selected the exact fixture Workspace.
3. Selected `Claude Code`, `Claude Haiku`, and `Low` in separate visible UI actions.
4. Sent `Reply with exactly CLD_TXT001_PLAIN_OK_1001. Do not call tools.` and waited
   for terminal completion.
5. Inspected the DSH archive, link record, Workspace manifest, and screenshot.

## Cases selected

- `cases/CLD-TXT-001--plain-text-turn.md` (`CLD-TXT-001`)

## Deviations

- A separate empty-configuration preflight returned `Not logged in · Please run /login`.
  It used a different DSH home/link store, produced no product-capability evidence, and is
  excluded from this run. The formal run used the normal authenticated Claude root.
- The final marker also appears inside the separately rendered thinking summary. There is
  exactly one terminal text block; thinking duplication is evaluated independently by
  `CLD-TXT-005`.

## Evidence index

- `evidence/CLD-TXT-001/link-summary.json`
- `evidence/CLD-TXT-001/archive-summary.json`
- `evidence/CLD-TXT-001/observations.md`
- `evidence/CLD-TXT-001/completed-turn.png`
- `evidence/CLD-TXT-001/review.md`
