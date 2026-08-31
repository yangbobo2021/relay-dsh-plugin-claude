# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_txt010

## Environment

- Finished: 2026-08-29 16:29 Asia/Shanghai; operator: Codex protocol + live validation
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS arm64
- Repository state: validation/spec untracked; product source unchanged

## Configuration

- Isolated DSH/link environment `/private/tmp/relay-cld-live002.p2EkK4/`
- Standard authenticated Claude root; only sanitized exact new-Session metadata retained
- Claude Sonnet Medium / Workspace Write / on-request

## Commands and actions

Snapshotted native Session filenames, created a fresh business Session, waited for its
answer and generated DSH title, resolved link/archive/native identities, and compared
both new native JSONL files. Self-review found the first trial's title answer equalled
the business marker, so a second fresh trial deliberately produced distinct business
and title answers and repeated all checks before closure.

## Cases selected

- `cases/CLD-TXT-010--auxiliary-title-isolation.md`

## Deviations

- One strengthening rerun was added after self-review; both trials passed structurally.

## Evidence index

- `evidence/CLD-TXT-010/isolation-evidence.json`
- `evidence/CLD-TXT-010/observations.md`
- `evidence/CLD-TXT-010/dsh-settled.png`
- `evidence/CLD-TXT-010/dsh-distinct-title.png`
- `evidence/CLD-TXT-010/review.md`
