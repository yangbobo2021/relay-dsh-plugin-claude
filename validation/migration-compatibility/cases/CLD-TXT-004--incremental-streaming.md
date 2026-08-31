# CLD-TXT-004 — Incremental streaming

## Traceability

- Primary requirement: `CLD-TXT-004`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `L`, `W`
- Priority: `P0`

## Objective

Prove that assistant answer text becomes visible in DSH before the live Claude turn
reaches terminal completion, rather than arriving only as one completed payload.

## Preconditions

- `CLD-TXT-003` is closed; use a fresh DSH/Claude Session.
- Live SDK and visible browser automation are available.
- The prompt describes, but does not contain, exact full markers
  `CLD_STREAM_BEGIN_1004` and `CLD_STREAM_END_1004`.

## Method

1. Create a fresh Claude Code Haiku/Low Session.
2. Ask for a long deterministic response: derived begin marker, 250 numbered stream
   lines, then derived end marker, with no tools.
3. From the same browser interaction, sample rendered assistant paragraphs and the Stop
   button at short intervals. Record the first sample where the begin marker is visible.
4. Require that sample to have the Stop button present and the end marker absent. Then
   require a later terminal sample with the end marker and no Stop button.
5. Inspect persistent turn completion and retain the timing trace, screenshot, and review.

## Expected results

- Required observable: answer begin text is visible strictly before terminal completion.
- Forbidden observable: begin and end first appear only after completion, prompt/reasoning
  false positive, missing final marker, or tool activity.
- Presentation expectation: the partial state is user-visible in the conversation area.

## Evidence to retain

- Millisecond sample trace with active/begin/end state.
- Completed archive and screenshot.
- Prompt evidence proving full markers were absent from the user input.

## Result interpretation

- Pass only when a partial assistant-text sample precedes completion and has no end marker.
- Fail when SDK completes but DSH exposes answer text only after completion.
- Blocked only for account/network/Host or browser-observation infrastructure failure.
