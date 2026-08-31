# CLD-TXT-006 — Multi-turn context

## Traceability

- Primary requirement: `CLD-TXT-006`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `L`, `W`
- Priority: `P0`

## Objective

Prove that a second DSH turn continues the exact same live Claude Agent SDK Session and
recalls a private first-turn marker not present in the second prompt.

## Preconditions

- `CLD-TXT-005` is closed; create one fresh DSH/Claude Session.
- Private marker is `CLD_CTX_PRIVATE_1006_Q7NX`.
- Link store, archive, and Workspace baselines are recorded before turn one.

## Method

1. In a fresh Claude Code Haiku/Low Session, ask Claude to remember the private marker and
   reply only `ACK_CTX_1006`, with no tools.
2. Record the DSH Session ID, Claude Session ID, link digest, archive digest, and first
   completed turn.
3. In the same visible DSH Session, ask for the private marker without including it.
4. Require exact recall, two ordered completed turns in one archive, unchanged link
   mapping/Claude Session ID, no replacement DSH Session, and zero tools.
5. Retain before/after evidence, screenshot, and self-review.

## Expected results

- Required observable: second turn returns exact `CLD_CTX_PRIVATE_1006_Q7NX`.
- Forbidden observable: marker in second prompt, context loss, new Claude binding, new
  DSH Session, extra terminal prose, or tool activity.
- Persistence expectation: both turns remain ordered in the owning Session archive.

## Evidence to retain

- Link/archive identities and digests before/after each turn.
- Marker-free second prompt and exact persisted final.
- Two-turn UI screenshot and zero-tool summary.

## Result interpretation

- Pass only when exact recall and immutable Session binding both hold.
- Fail when SDK executes but loses context or silently replaces the Session.
- Blocked only for account/network/Host infrastructure failure.
