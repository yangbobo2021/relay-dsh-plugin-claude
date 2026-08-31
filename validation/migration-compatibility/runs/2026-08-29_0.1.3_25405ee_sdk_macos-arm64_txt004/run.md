# Claude Validation Run 2026-08-29_0.1.3_25405ee_sdk_macos-arm64_txt004

## Environment

- Started / finished: 2026-08-29 16:05–16:06 Asia/Shanghai
- Operator: Codex synchronized DSH Web sampler
- Plugin / commit: `0.1.3` / `25405ee35c30333788538f44a1772c7bad9eb7cf`
- Agent SDK / Claude Code / backend: `0.3.233` / `2.1.233` / `sdk`
- DSH / Node / platform: official `0.1.0-rc.8` / `v25.5.0` / macOS 15.3.1 arm64
- Repository state: validation/spec directories untracked; product source unchanged

## Configuration

- Isolated DSH/link environment: `/private/tmp/relay-cld-live002.p2EkK4/`
- Standard authenticated Claude root; contents not inspected or retained
- Claude Haiku / Low / Workspace Write / on-request

## Commands and actions

Two fresh Sessions were sampled at approximately 125ms intervals. The primary emitted
250 numbered lines; the confirmation emitted 200. Full begin/end markers were described
compositionally and absent from both prompts. The confirmation saved a screenshot at the
first begin-visible/active/end-absent sample and another after completion.

## Cases selected

- `cases/CLD-TXT-004--incremental-streaming.md`

## Deviations

- The confirmation retry was added during self-review to retain direct visual evidence of
  the transient partial state. Both independent trials satisfy the same timing assertion.

## Evidence index

- `evidence/CLD-TXT-004/timing.json`
- `evidence/CLD-TXT-004/observations.md`
- `evidence/CLD-TXT-004/partial-active.png`
- `evidence/CLD-TXT-004/completed.png`
- `evidence/CLD-TXT-004/review.md`
