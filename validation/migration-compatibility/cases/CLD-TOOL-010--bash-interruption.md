# CLD-TOOL-010 — Bash interruption

## Traceability

- Primary requirement: `CLD-TOOL-010`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove that stopping an active Claude turn terminates its Bash process and prevents delayed
output and delayed filesystem mutation.

## Method

1. Record exact Workspace/object/native baselines and prove both generated targets are absent.
   In a fresh Claude Code Session require only Bash to run exactly:
   `printf 'CLD_TOOL010_STARTED_FILE_1010\n' > interrupt/tool010-started.txt; printf
   'CLD_TOOL010_STARTED_1010\n'; sleep 15; printf
   'CLD_TOOL010_LATE_1010\n'; printf 'CLD_TOOL010_LATE_FILE_1010\n' >
   interrupt/tool010-late.txt`.
2. Allow once if requested. Poll for the exact immediate started-file bytes; after they appear,
   press Stop once without waiting for the delayed branch.
3. Wait at least 18 seconds after stopping. Assert the late output marker never appears, the
   late file remains absent, the baseline file and all prior files are unchanged, and no model
   recovery/final is appended automatically.
4. Inspect native interrupted/error result, DSH abort/activity/turn terminal events, process
   count, object state, and self-review.

## Expected results

- Required observable: the immediate file proves Bash started; DSH records the user stop; native
  state is an interruption/cancellation error; no late marker or late file appears after the
  original deadline.
- Forbidden observable: late output/file, surviving child process, automatic retry/alternate
  tool, false normal success, repeated stop, or unrelated mutation.

## Result interpretation

- Pass only when durable stop semantics and the post-deadline negative assertions both pass.
- Fail if work continues after stop or interruption is misrepresented as normal success.
- Blocked only for backend/tool infrastructure outage.
