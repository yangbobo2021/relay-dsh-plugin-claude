# CLD-TOOL-009 — Long-running Bash streaming

## Traceability

- Primary requirement: `CLD-TOOL-009`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P1`

## Objective

Prove that stdout from a still-running Bash process is exposed incrementally, before later
stdout and before tool completion.

## Method

1. Capture complete Workspace/object/native baselines. In a fresh Session require only Bash
   to run exactly `printf 'CLD_TOOL009_FIRST_9009\n'; sleep 15; printf
   'CLD_TOOL009_LAST_9009\n'` and then reply exactly `CLD_TOOL009_DONE_9009`.
2. Allow once if requested. Sample the visible Session state at short intervals after approval,
   recording the first instant each marker and the final become visible. Save a screenshot while
   FIRST is visible but LAST and the final are absent, if that state occurs.
3. Inspect native and DSH records for the exact command, tool-result output, activity phases,
   approval, final text, and completion. Assert no Workspace/object mutation.
4. Self-review whether the evidence proves interim visibility rather than retrospective final
   rendering.

## Expected results

- Required observable: FIRST is visibly presented while Bash is still running and at least one
  second before LAST; later, both markers and the exact final persist in the completed turn.
- Forbidden observable: FIRST appears only after LAST/tool completion, reordered or missing
  markers, retry/alternate tool, mutation, or inference from final logs alone.

## Result interpretation

- Pass only with a timestamped live interim observation plus consistent terminal persistence.
- Fail when output is buffered until completion even if the final result is otherwise correct.
- Blocked only for backend/tool infrastructure outage.
