# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_ext005

## Environment

- Finished: 2026-08-29 18:33 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec artifact additions only; product source unchanged

## Configuration

- Immutable global user Skill copied byte-for-byte from the canonical repository fixture
- Fresh tool-workspace Claude Sonnet/Medium/Workspace Write Session
- Marker-free prompt explicitly requests one Skill, one Read, and one Bash

## Commands and actions

Reverified all three source/global digests, submitted the isolated request, approved the external
reference Read and each Bash once, captured the terminal UI, inspected native/DSH records and
state, self-reviewed the duplicate recovery call, then removed only the temporary global fixture.

## Cases selected

- `cases/CLD-EXT-005--skill-resource-script.md`

## Deviations

- Claude issued `bash scripts/emit-marker.sh` from the Workspace rather than the injected Skill
  base, received exit 127, and issued a second corrective Bash. This is the observed failure, not
  a protocol deviation by the operator.
- Read also required an outside-Workspace approval; it was allowed once so the intended resource
  path could be evaluated.

## Evidence index

- `evidence/CLD-EXT-005/bundled-resource-evidence.json`
- `evidence/CLD-EXT-005/observations.md`
- `evidence/CLD-EXT-005/final.png`
- `evidence/CLD-EXT-005/review.md`
