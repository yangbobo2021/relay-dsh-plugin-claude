# CLD-TXT-010 — Auxiliary title isolation

## Traceability

- Primary requirement: `CLD-TXT-010`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `L`, `W`
- Priority: `P1`

## Objective

Prove that DSH session-title generation uses a separate ephemeral Claude Session and
does not add its title prompt or answer to the linked business Claude Session.

## Preconditions

- `CLD-TXT-009` is closed; use a fresh DSH/Claude Session.
- Record the native Claude project JSONL filename set before send.
- Inspect only newly created exact Session files and retain sanitized evidence.

## Method

1. Create a fresh Claude Code Session and send one unique exact no-tool marker prompt.
2. Wait for both the business answer and DSH title generation to settle.
3. Resolve the business Claude Session from the Relay link store and compare the native
   JSONL filename set before/after the turn.
4. Require the linked business JSONL to contain exactly one conversational `user` and
   one conversational `assistant`, with no DSH title system prompt, user prompt, answer,
   or second model turn.
5. Require the DSH title request to exist in a different ephemeral native Session that
   is absent from the Relay business link store; classify any business-file `ai-title`
   record separately as non-conversational Claude Code metadata.
6. Retain sanitized native/DSH identity and event summaries, digests, a settled UI
   screenshot, zero-tool evidence, and a self-review.

## Expected results

- Required observable: one linked business Session has only the business user/assistant
  pair; a separate unlinked native Session contains the auxiliary title exchange.
- Forbidden observable: title prompt/answer in business conversational history, a
  second business assistant turn, title Session linked as the business Session, missing
  title request, failed business final, or tool activity.
- Presentation expectation: DSH displays the generated title and the exact business
  answer without exposing the title prompt as a chat message.

## Evidence to retain

- Sanitized native Session event classifications and file digests.
- Relay link and DSH archive route/event summaries plus UI screenshot.
- No credentials, unrelated Sessions, raw configuration, or unrelated native content.

## Result interpretation

- Pass only when native and DSH evidence independently establish the isolation boundary.
- Fail when any auxiliary title content becomes a business user/assistant message.
- Blocked only when exact new native Session ownership cannot be resolved safely.
