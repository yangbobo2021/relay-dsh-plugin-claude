# CLD-TOOL-008 — Bash failure

## Traceability

- Primary requirement: `CLD-TOOL-008`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove that Bash stderr and a deliberate non-zero exit are represented as a tool failure
without failing or wedging the owning Claude turn.

## Method

1. Capture complete Workspace/object/native baselines. In a fresh Session require only Bash
   to run exactly `printf 'CLD_TOOL008_STDERR_8008\n' >&2; exit 23`.
2. Allow once if requested. Require Claude to recognize the failure and reply exactly
   `FAIL_RESULT=exit23|CLD_TOOL008_STDERR_8008` without retrying or another tool.
3. Inspect native structured stdout/stderr/interrupted/error fields, tool content, DSH
   failed/completed activity representation, approval, final text, and turn completion.
4. Assert no Workspace/object mutation and self-review.

## Expected results

- Required observable: stderr marker and exit 23 are explicit; tool is an error but turn
  completes with the exact interpretation.
- Forbidden observable: false success, swallowed/misattributed stderr, retry, alternate tool,
  Session failure, mutation, or marker only copied from prompt without tool evidence.

## Result interpretation

- Pass only when failure semantics and continued turn usability both pass.
- Fail on hidden/false status, lost stderr, or failed owning turn.
- Blocked only for backend/tool infrastructure outage.
