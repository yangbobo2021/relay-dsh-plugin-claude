# CLD-TXT-002 — Chinese and Unicode round trip

## Traceability

- Primary requirement: `CLD-TXT-002`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `L`, `W`
- Priority: `P0`

## Objective

Prove that Chinese text and a non-BMP Emoji marker traverse DSH, the live Claude Agent
SDK, persistence, and rendering without corruption, escaping, normalization, or loss.

## Preconditions

- `CLD-TXT-001` is closed; this case uses a new DSH Session and Claude Session binding.
- Live SDK authentication/network and the deterministic plain-text Workspace are available.
- Exact UTF-8 marker is `CLD_TXT002_中文_🚀_1002`.

## Method

1. Record the current link mapping set and fixture manifest, then create a fresh DSH
   Session in the same isolated official Host.
2. Select `Claude Code`, `Claude Haiku`, `Low`, and send:
   `请仅回复以下标记，不要调用工具：CLD_TXT002_中文_🚀_1002`
3. Require one exact terminal text block whose Unicode scalar sequence and UTF-8 bytes
   equal the marker, no tool activity, and one new Claude Session binding.
4. Compare the persisted DSH archive, visible UI, and independent byte oracle. Retain
   screenshot, digests, and self-review before starting the next case.

## Expected results

- Required observable: exact `CLD_TXT002_中文_🚀_1002` final text.
- Forbidden observable: replacement characters, escaped literals, normalized changes,
  extra terminal prose, duplicated terminal block, or tool call.
- SDK/persistence/presentation expectation: all layers retain identical UTF-8 bytes.

## Evidence to retain

- Sanitized archive/link summaries and independent UTF-8 code-point/byte oracle.
- Link-set and Workspace before/after digests.
- Visible completed-turn screenshot.
- No credentials or unrelated user configuration.

## Result interpretation

- Pass when the exact marker is byte-identical across input, terminal output, archive,
  and UI and the new binding is unique.
- Fail when the SDK executes but any layer corrupts, escapes, normalizes, or loses it.
- Blocked only when authentication, network, or Host infrastructure prevents execution.
