# CLD-TOOL-015 — Tool approval

## Traceability

- Primary requirement: `CLD-TOOL-015`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove both approval branches independently: allow-once executes exactly the requested tool and
deny prevents execution and side effects.

## Method

1. Capture exact Workspace/object/native baselines and prove both targets absent.
2. Allow branch, fresh Session: require only Bash to write exact bytes to
   `approval/tool015-allowed.txt`; allow once; require exact final `ALLOW_RESULT=created`; verify
   command, decision, result, bytes, and no unrelated mutation.
3. Deny branch, second fresh Session: require only Bash to write exact bytes to
   `approval/tool015-denied.txt`; deny once at the surfaced approval; wait for terminal state and
   past a safety interval; verify no command side effect, retry, alternate tool, or target.
4. Inspect both native/DSH approval lifecycles, results/terminal states, binding isolation, complete
   state delta, and self-review.

## Expected results

- Required observable: one allow-once decision creates only the allowed exact file and completes;
  one deny decision leaves the denied target absent and is durably represented.
- Forbidden observable: execution before decision, allow without effect, denied effect, reused
  decision, retry/alternate tool, cross-Session leakage, wrong bytes, or unrelated mutation.

## Result interpretation

- Pass only when both independently isolated branches and side-effect assertions pass.
- Fail if either decision is ignored, misrouted, or incorrectly represented.
- Blocked only for backend/tool infrastructure outage.
