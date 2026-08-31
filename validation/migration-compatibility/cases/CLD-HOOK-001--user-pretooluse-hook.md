# CLD-HOOK-001 — User PreToolUse hook

## Traceability

- Primary requirement: `CLD-HOOK-001`
- Backend applicability: `sdk`
- Verification levels: `P`, `L`
- Priority: `P0`

## Objective

Prove a user PreToolUse hook observes exactly its target fixture call through Relay.

## Method

1. Guard/replace user settings with a sanitized Bash PreToolUse command recorder.
2. Fresh no-tool control must create no hook record.
3. Fresh target Session invokes one exact read-only Bash; require one pre-tool record with exact event,
   tool input/session/cwd before completed stdout.
4. Restore settings, remove log, compare transcripts/state and self-review approval interaction.

## Expected results

- Required observable: zero control records, exactly one target record and completed exact stdout.
- Forbidden observable: extra event, wrong input, post-only timing, persistent user/log state or fallback.

## Result interpretation

- Pass only when independent hook and native tool records agree.
- Fail if hook is ignored, duplicated or mis-scoped.
