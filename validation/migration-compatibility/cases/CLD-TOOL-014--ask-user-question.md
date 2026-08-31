# CLD-TOOL-014 — AskUserQuestion

## Traceability

- Primary requirement: `CLD-TOOL-014`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove that a Claude-authored AskUserQuestion becomes an interactive DSH pause, accepts one user
selection, and returns that exact answer to the same Claude Session before final completion.

## Method

1. Capture Workspace/object/native baselines. In a fresh Claude Code Session require exactly one
   AskUserQuestion with header `Pick`, question `Choose CLD_TOOL014 option`, and two options
   `ALPHA_1414` and `BETA_1414`. Permit ToolSearch only to load AskUserQuestion.
2. Wait for the interactive prompt. Before answering, assert both options are visible, the owning
   turn is paused, no final exists, and the same business Session remains bound; capture evidence.
3. Select `BETA_1414` once and submit once. Require exact final `ASK_RESULT=BETA_1414`.
4. Inspect native question schema/result, DSH activity/interaction/completion, link continuity,
   state immutability, and self-review.

## Expected results

- Required observable: one real question pauses; BETA is the submitted structured answer; same
  Session resumes and emits the exact final.
- Forbidden observable: self-answer, plain-text imitation, no pause, wrong/default option, multiple
  submissions, new business Session, alternate tool, mutation, or fabricated final.

## Result interpretation

- Pass only when pause, interaction, structured answer, continuity, and final all agree.
- Fail on unavailable/noninteractive AskUserQuestion, lost/wrong answer, or continuity break.
- Blocked only for backend/tool infrastructure outage.
