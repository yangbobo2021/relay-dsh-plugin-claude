# CLD-IMG-008 — Promoted-image persistence

## Traceability

- Primary requirement: `CLD-IMG-008`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `L`, `W`
- Priority: `P0`

## Objective

Prove that a promoted assistant image is restored from persisted DSH state and remains
visible after a full Web page reload.

## Preconditions

- `CLD-IMG-007` is closed and its exact DSH Session remains selected.
- Require one visible `generated-img006.png` control and persisted `[text,image]` before
  reload. Record DSH archive, attachment object, Relay link, source, and native digests.
- No model turn or file mutation is permitted in this case.

## Method

1. Capture the pre-reload DOM/screenshot and exact Session/attachment identities.
2. Perform a full browser page reload and wait for DSH boot/session restoration. If the
   app restores only the Workspace view, select the same persisted Session explicitly.
3. Require the exact text and exactly one visible promoted image control after reload.
4. Require DSH archive, stored object, source, link state, native Session set, and
   Workspace path/digests to remain unchanged; require no new turn/event.
5. Retain sanitized before/after evidence and self-review that the test used a true page
   reload and persisted Session reconstruction rather than an in-memory rerender.

## Expected results

- Required observable: `generated-img006.png` remains a visible assistant image after
  reload in the same DSH Session.
- Forbidden observable: missing/duplicate image, broken image, text-only fallback,
  changed attachment ID/bytes, new model turn, changed archive/link/native/Workspace.
- Presentation expectation: restored chat preserves text then image ordering.

## Evidence to retain

- Before/after DOM counts, screenshots, identities, and cryptographic digests.
- No credentials, unrelated Sessions, or raw unrelated attachment content.

## Result interpretation

- Pass only when post-reload UI and immutable persisted evidence both agree.
- Fail when visibility depends on the pre-reload in-memory state.
- Blocked only for Web Host outage or inability to reload the selected Session.
