# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_tool003

## Environment

- Finished: 2026-08-29 17:32 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec/fixture artifact additions only; product source unchanged

## Configuration

- Isolated DSH/link environment `/private/tmp/relay-cld-live002.p2EkK4/`
- Dedicated tool Workspace with a 58-byte exact-read fixture
- Fresh Standard/Claude Sonnet/Medium/Workspace Write Session

## Commands and actions

Recorded byte/hex/digest baseline, forced one built-in Read while prohibiting alternatives,
captured native and DSH tool/result/final state, normalized only Read's standard line-number
prefixes, compared both normalized tool output and unwrapped final payload byte-for-byte,
checked mutation/object state, and self-reviewed.

## Cases selected

- `cases/CLD-TOOL-003--read-exact-content.md`

## Deviations

The first post-run JSONL extraction command omitted jq slurp mode, emitted type errors, and
produced empty temporary comparison files. It was immediately rerun correctly with `jq -s`;
only the successful digest-equal comparison is used. The model run was unaffected.

## Evidence index

- `evidence/CLD-TOOL-003/read-evidence.json`
- `evidence/CLD-TOOL-003/observations.md`
- `evidence/CLD-TOOL-003/final.png`
- `evidence/CLD-TOOL-003/review.md`
