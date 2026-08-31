# CLD-IMG-007 — Final-path image promotion

## Traceability

- Primary requirement: `CLD-IMG-007`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove that a local image path appearing in Claude's final answer is snapshotted into DSH
attachment storage and emitted as a standard visible assistant image block.

## Preconditions

- `CLD-IMG-006` is closed; use its independently validated `generated-img006.png` in a
  fresh Claude Session in the same Workspace.
- Record source PNG digest/metadata, Workspace path set/digests, attachment-object set,
  and native Session set before the turn.
- No tool is needed: the prompt asks only for an exact final path reference.

## Method

1. Ask Claude, without tools, to return exactly `IMAGE_RESULT=./generated-img006.png`.
2. Require one final text block and exactly one promoted standard image block in DSH/UI.
3. Require the image ref to name `generated-img006.png`, use `image/png`, and resolve to
   a newly stored immutable object whose bytes/digest match the source at promotion time.
4. Correlate native exact final and zero tools, Relay link/replay identity, DSH block
   order, completed turn, and unchanged Workspace files.
5. Retain sanitized evidence and self-review whether visibility is an actual DSH image
   block rather than Markdown rendering or a browser-local file reference.

## Expected results

- Required observable: DSH assistant content includes exact text plus one image attachment
  block; UI visibly renders the promoted PNG.
- Forbidden observable: text-only path, Markdown-only image, missing/duplicate image,
  byte mismatch, tool activity, changed Workspace, failed turn, or promotion diagnostic.
- Presentation expectation: the image remains separate from the text block in chat.

## Evidence to retain

- Source and stored attachment metadata/digests and object-set delta.
- Sanitized DSH/native block summaries, identities, and UI screenshot.
- No credentials, unrelated Sessions, or raw unrelated attachment content.

## Result interpretation

- Pass only when persisted block structure and stored bytes prove standard promotion.
- Fail when only a textual/local-path reference is presented or bytes are not persisted.
- Blocked only for unavailable DSH attachment storage or backend outage.
