# CLD-IMG-003 — Ordered multi-image input

## Traceability

- Primary requirement: `CLD-IMG-003`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P1`

## Objective

Prove that two DSH image attachments reach Claude as distinct image blocks in the same
order the user supplied them.

## Preconditions

- `CLD-IMG-002` is closed; use a fresh DSH/Claude Session.
- Render and fingerprint the two text-free 400×400 fixtures independently.
- First image: one red square. Second image: one blue circle. Clipboard names must not
  disclose their role or content.

## Method

1. Paste `ordered-first.png`, then `ordered-second.png`, into one fresh DSH composer and
   require exactly two visible image previews before send.
2. Without naming expected colors or shapes, ask Claude for one rigid record describing
   the dominant object in FIRST and SECOND attachment order; prohibit tools/explanation.
3. Require the exact precommitted record and no swapped, duplicated, or missing image.
4. Correlate UI preview count/order, DSH attachment refs/order, local stored objects,
   Relay link/replay state, native Claude `[image,image,text]` order and decoded hashes,
   terminal answer, zero tools, and unchanged fixture bytes.
5. Retain sanitized evidence and self-review whether filenames, prompt text, or other
   context could reveal the answer without preserving both image blocks in order.

## Expected results

- Required observable: exact `FIRST=SQUARE,RED;SECOND=CIRCLE,BLUE`.
- Forbidden observable: swapped result, wrong shape/color, fewer or more than two image
  blocks, equal attachment IDs, tool activity, attachment failure, or changed fixtures.
- Presentation expectation: DSH shows two previews in supplied order and one exact final.

## Evidence to retain

- Independent fixture/render metadata and digests.
- Ordered DSH/native attachment summaries and decoded hashes, identities, and screenshot.
- No raw Base64 payload, credentials, unrelated Sessions, or unrelated native content.

## Result interpretation

- Pass only when answer and both transport layers independently prove identity and order.
- Fail when either image is lost, duplicated, swapped, or incorrectly interpreted.
- Blocked only for unavailable multi-image DSH attachment UI/service or backend outage.
