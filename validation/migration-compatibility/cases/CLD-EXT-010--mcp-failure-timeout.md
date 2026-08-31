# CLD-EXT-010 — MCP failure and timeout

## Traceability

- Primary requirement: `CLD-EXT-010`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P1`

## Objective

Prove independently that explicit MCP error results and per-server hard timeouts are visible,
bounded, non-retried, and do not wedge the owning Claude/DSH Session.

## Method

1. Install an immutable project STDIO server with `explicit_failure` and eight-second `slow_timeout`
   tools, append-only millisecond log, and documented per-server `timeout: 1500`; record baselines.
2. Explicit-error branch: fresh Session, exact schema selector and one `explicit_failure` call, allow
   once, forbid retry/fallback, require exact error marker and error lifecycle, then complete a
   no-tool recovery second turn on the same Claude binding.
3. Timeout branch: fresh Session, exact selector and one `slow_timeout` call, allow once, forbid
   retry/fallback, require an explicit timeout approximately 1.5 seconds after server start and no
   late result in transcript, then complete a no-tool recovery second turn on the same binding.
4. Wait past the server's eight-second late finish, inspect native/DSH/log timelines, exact call
   counts, both recovery turns, binding/state/source/config digests, and self-review.
5. Archive evidence, remove temporary config, confirm all fixture processes exit and no late result
   appears after cleanup, then advance.

## Expected results

- Required observable: one explicit error and one bounded timeout are each visible; each Session
  completes a same-binding recovery turn; server/native/DSH timelines agree.
- Forbidden observable: success masking, retry/fallback, timeout result delivered late, wrong timeout
  order, wedged Session, unrelated mutation, lingering config/process, or leak.

## Result interpretation

- Pass only when both failure modes, timing, no-late-delivery, continuity, state, and cleanup pass.
- Fail if either failure is hidden/unbounded, retried, or prevents recovery.
- Blocked only for backend infrastructure outage unrelated to fixture behavior.
