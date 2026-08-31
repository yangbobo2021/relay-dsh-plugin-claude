# CLD-EXT-019 — Dynamic DSH tool refresh

## Traceability

- Primary requirement: `CLD-EXT-019`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`
- Priority: `P1`

## Objective

Prove that Relay rebuilds the in-process DSH MCP bridge from the current turn's schemas when a later
turn resumes the same Claude Session: a newly added tool must become callable and a removed tool must
no longer be discoverable or executable.

## Method

1. Start the production `ClaudeSdkClient` with the installed real Claude Agent SDK in the sanitized
   tool Workspace and create one fresh Claude Session with no setting sources.
2. Turn 1 advertises only `refresh_alpha`; require one exact ToolSearch selector, one exact call and
   the handler result `ALPHA_RESULT_1919` before an exact terminal marker.
3. Resume the same Session for turn 2 while advertising only `refresh_beta`; require exact selectors
   for both beta and removed alpha, one beta call/result, zero later alpha calls, and an exact marker.
4. Compare Session IDs, structured activities, executor ledger, native transcript, source digests and
   Workspace/Git/config baselines. Self-review model compliance separately from bridge behavior.

## Expected results

- Required observable: one Session ID across both completed turns; alpha executes only in turn 1;
  beta is discovered and executes in turn 2; the turn-2 alpha selector has no matching reference and
  the removed alpha handler never executes.
- Forbidden observable: Session rebinding, stale alpha reference/call in turn 2, missing beta schema,
  fallback tool, approval prompt, retry, mutation, or result loss.

## Result interpretation

- Pass only when the real SDK proves both addition and removal on the same resumed Session.
- Fail if the later query retains stale tools, misses the new tool, or requires a new Session.
- Blocked only if the live Claude SDK cannot be invoked after environmental checks.
