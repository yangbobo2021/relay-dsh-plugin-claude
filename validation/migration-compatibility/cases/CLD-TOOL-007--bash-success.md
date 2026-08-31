# CLD-TOOL-007 — Bash success

## Traceability

- Primary requirement: `CLD-TOOL-007`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove that a successful built-in Bash command's exact stdout and non-error completion reach
Claude and DSH without Workspace mutation.

## Method

1. Capture complete Workspace/object/native baselines. In a fresh Session require Bash to
   run exactly `printf 'CLD_TOOL007_STDOUT_7007\n'; exit 0` and no other tool.
2. Allow the command if approval surfaces; require exact final `CLD_TOOL007_STDOUT_7007`.
3. Inspect native tool input/result for exact stdout and non-error/zero-exit semantics; inspect
   DSH activity output and completed turn.
4. Assert no file/object change, correlate approvals, screenshot, and self-review.

## Expected results

- Required observable: exact stdout appears in successful tool result, DSH activity, and final.
- Forbidden observable: stderr, error/nonzero status, missing/duplicated output, alternate tool,
  mutation, or final text unsupported by a real Bash result.

## Result interpretation

- Pass only when all three output surfaces and success state agree.
- Fail on loss, duplication, false success, or mutation.
- Blocked only for backend/tool infrastructure outage.
