# CLD-TOOL-011 — Test execution

## Traceability

- Primary requirement: `CLD-TOOL-011`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove that Claude can execute a fixed project test command and correctly interpret its mixed
passing/failing result rather than treating command completion as test success.

## Method

1. Independently calibrate `node --test tests/tool011-mixed.test.mjs`; precommit its fixture hash,
   two-test total, one pass, one named intentional failure, and non-zero exit.
2. Capture Workspace/object/native baselines. In a fresh Claude Code Session require only Bash
   to run that exact command once and reply exactly
   `TEST_RESULT=exit1|tests2|pass1|fail1|failed=CLD_TOOL011_FAIL_1111`.
3. Allow once if requested. Inspect exact native command/result, structured stdout/stderr/error,
   DSH approval/activity/output/final/turn state, and fixture/unrelated state.
4. Self-review that the final interpretation is grounded in actual test output.

## Expected results

- Required observable: the tool output proves two tests, one pass, one intentional named failure,
  and exit 1; the exact final interpretation agrees.
- Forbidden observable: false all-pass, swallowed non-zero exit, fabricated totals/name, retry,
  alternate tool, mutation, or prompt-only echo without test-result evidence.

## Result interpretation

- Pass only when execution evidence and interpretation both match the calibrated suite.
- Fail on incorrect execution status, totals, failure identity, or final interpretation.
- Blocked only for backend/tool infrastructure outage.
