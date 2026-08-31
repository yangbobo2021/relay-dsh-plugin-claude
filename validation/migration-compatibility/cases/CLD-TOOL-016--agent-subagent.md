# CLD-TOOL-016 — Agent/subagent tool

## Traceability

- Primary requirement: `CLD-TOOL-016`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P1`

## Objective

Prove that a parent Claude Session can launch one real child through the Agent tool, receive the
child's exact result, and continue the same owning turn.

## Method

1. Capture Workspace/object/native baselines. In a fresh Claude Code Session permit ToolSearch
   only to load Agent, then require exactly one Agent with `subagent_type: general-purpose`,
   description `CLD_TOOL016 child`, and a prompt that returns only `CHILD_RESULT_1616` without tools.
2. Require the parent to reply exactly `PARENT_RESULT=CHILD_RESULT_1616` only after the Agent tool
   result. Allow once if surfaced; forbid all other parent tools and mutations.
3. Inspect native parent tool schema/result, child identity/session evidence, DSH Agent lifecycle,
   result attribution, parent final/turn completion, and binding continuity.
4. Compare complete Workspace/object state and self-review against prompt echo or parent-only text.

## Expected results

- Required observable: one child is actually dispatched; its exact marker is present in Agent
  result content; the original parent Session emits the exact final and completes.
- Forbidden observable: parent fabricates marker without Agent evidence, no child, wrong child
  type/result, extra tool/child, detached/new parent binding, mutation, or wedged turn.

## Result interpretation

- Pass only when child dispatch, child result, parent continuity, and final all agree.
- Fail on unavailable Agent, lost/misattributed child result, or broken owning turn.
- Blocked only for backend/tool infrastructure outage.
