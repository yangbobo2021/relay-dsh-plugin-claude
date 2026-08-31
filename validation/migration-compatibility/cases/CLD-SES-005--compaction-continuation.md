# CLD-SES-005 — Long-context compaction continuation

## Traceability

- Primary requirement: `CLD-SES-005`
- Backend applicability: `sdk`
- Verification levels: `P`, `L`
- Priority: `P1`

## Objective

Prove an early unique marker survives Claude's supported compaction path on the same Relay Session.

## Method

1. Guard project settings and install independent PreCompact/PostCompact recorders.
2. Turn 1: establish one early unique marker and exact acknowledgement with no tools.
3. Turn 2: invoke official manual `/compact` with instructions to retain important identifiers; require one
   PreCompact/manual, one PostCompact/manual and native `compact_boundary` on the same Session.
4. Turn 3: ask for the marker without including it; require exact recall, same Session ID, cleanup and self-review.

## Expected results

- Required observable: true compact boundary with both hooks, then exact unprompted marker recall.
- Forbidden observable: treating ordinary multi-turn memory/model summary text as compaction, new Session or residue.

## Result interpretation

- Pass only when independent lifecycle/native evidence proves compaction actually occurred.
- Fail if the supported path loses the marker or Relay cannot carry compaction continuation.
