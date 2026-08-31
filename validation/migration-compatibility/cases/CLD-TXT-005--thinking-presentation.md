# CLD-TXT-005 — Thinking presentation

## Traceability

- Primary requirement: `CLD-TXT-005`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `L`, `W`
- Priority: `P1`

## Objective

Prove that live Claude thinking is retained and presented as a distinct non-empty
reasoning block while the terminal answer remains one separate, non-duplicated text block.

## Preconditions

- `CLD-TXT-004` is closed; use a new DSH/Claude Session.
- SDK query options request adaptive summarized thinking.
- Deterministic arithmetic oracle: `137 × 29 = 3973`.

## Method

1. Create a fresh Claude Code Haiku/Low Session.
2. Ask Claude to calculate `137 × 29` without tools and return only the formatted final
   `CLD_THINK_RESULT_<number>_1005`.
3. Require one assistant message containing exactly one non-empty `reasoning` block and
   one exact `text` block `CLD_THINK_RESULT_3973_1005`; require the blocks to differ.
4. Require one visible Think control and one exact terminal paragraph, with no second
   terminal paragraph or tool event. Retain screenshot/archive and self-review.

## Expected results

- Required observable: distinct readable thinking and exact final presentation.
- Forbidden observable: empty reasoning, merged thinking/final, duplicated terminal
  paragraph, reasoning reused as final, wrong calculation, or tool activity.
- Persistence expectation: the typed content blocks remain distinct in the DSH archive.

## Evidence to retain

- Assistant content-block types, counts, text lengths/digests, and turn status.
- DOM control/paragraph counts and visible screenshot.
- Session/link identity and zero-tool count.

## Result interpretation

- Pass when archive and UI independently show one distinct non-empty thinking block and
  one exact terminal answer.
- Fail when SDK executes but reasoning is empty, missing, merged, or duplicated.
- Blocked only for account/network/Host infrastructure failure.
