# CLD-SES-002 — Browser reload continuation

## Traceability

- Primary requirement: `CLD-SES-002`
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove a full browser reload restores the DSH conversation and continues the same business Claude Session.

## Method

1. Start from a completed one-turn live Claude Code Session; record DSH/Claude link, archive and native hashes.
2. Full-reload the browser tab; require the original prompt/final and Claude preset to reappear automatically.
3. Ask for the immediately preceding output token without including that token in the follow-up; require exact
   recall plus a new marker, no tools, and the same link entry.
4. Compare native/DSH growth, Session IDs, visible two-turn state and self-review title/auxiliary isolation.

## Expected results

- Required observable: restored first turn, correct unprompted recall, same Claude ID and two completed turns.
- Forbidden observable: new business binding, lost history, auxiliary takeover, duplicate turn or tool fallback.

## Result interpretation

- Pass only when UI recovery and persistent backend continuation agree.
- Fail if reload merely redraws history but starts a new Claude context.
