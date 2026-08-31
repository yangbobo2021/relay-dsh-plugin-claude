# CLD-TXT-009 — Effort selection

## Traceability

- Primary requirement: `CLD-TXT-009`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove that explicitly selecting High effort in DSH reaches the live Agent SDK/native
Claude Session rather than remaining only a UI or Relay configuration value.

## Preconditions

- `CLD-TXT-008` is closed; use a fresh DSH/Claude Session.
- Sonnet defaults to Medium; explicitly change it to High before send.
- Native Claude Session assistant records top-level `effort` and may be sanitized by ID.

## Method

1. Create a fresh Claude Code Sonnet Session and explicitly change effort Medium→High.
2. Send an exact no-tool marker prompt and complete the turn.
3. Require UI, Relay link config, DSH persisted source, and native Claude assistant event
   to share the exact Session ID; require native `effort: high`.
4. Run/focus the SDK option-mapping test asserting `query(options.effort)` receives the
   selected value, then retain live final, screenshot, zero tools, and self-review.

## Expected results

- Required observable: native Claude Session records `effort: high`.
- Forbidden observable: `medium`/`low`, missing native effort, UI-only change, wrong
  Session, failed final, or tool activity.
- Presentation expectation: owning DSH Session displays Claude Sonnet High.

## Evidence to retain

- Sanitized native assistant session/model/effort fields and digest.
- Link/archive/UI identities and focused protocol assertion.
- No credentials, unrelated Sessions, or configuration contents.

## Result interpretation

- Pass when mapping test and native live Session independently show the selected High.
- Fail when the turn executes with another effort or the adapter drops the value.
- Blocked only for account/network/Host or exact native Session evidence failure.
