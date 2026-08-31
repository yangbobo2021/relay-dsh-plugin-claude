# CLD-SES-003 — Host restart continuation

## Traceability

- Primary requirement: `CLD-SES-003`
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove restarting the dedicated DSH host restores and continues the same business Claude Session.

## Method

1. From a completed two-turn live Session, record exact listener PID, DSH home, link/native/archive hashes.
2. Gracefully terminate only the validated 4394 listener, prove the port closes, then launch the same DSH profile
   with the same DSH home and Relay Claude link path; require a distinct healthy PID.
3. Reload UI, require both prior turns/preset, then ask for the previous current token without including it.
4. Require exact third response, stable link/Claude ID, one native/archive growth, no tools; self-review process scope.

## Expected results

- Required observable: new host PID, restored two-turn UI, correct recall, same mapped Claude ID and third turn.
- Forbidden observable: lost/remapped binding, new business Session, missing history, duplicate turn or process leak.

## Result interpretation

- Pass only when host replacement and context continuation both prove durable state.
- Fail if continuity relies on in-memory host state.
