# CLD-IMG-005 — Invalid image rejection

## Traceability

- Primary requirement: `CLD-IMG-005`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove that bytes falsely labeled `image/png` are rejected before Relay creates a Claude
Session or invokes the Agent SDK query path.

## Preconditions

- `CLD-IMG-004` is closed; use a fresh unsent DSH composer.
- `invalid-image.png` is a deterministic short ASCII payload, not a decodable image.
- Snapshot link-store bytes, native Session filenames, DSH Session directories, and
  attachment-object filenames before the paste attempt.

## Method

1. Run focused SDK/adapter tests proving invalid image input leaves `query()` count,
   runtime Session creation, and runtime sends at zero.
2. Write the corrupt fixture to browser clipboard with MIME `image/png`, paste once into
   a fresh Claude composer, and wait for DSH attachment admission.
3. Require an explicit image-validation error. A rejected draft preview may remain for
   correction/retry, but it must not become a durable attachment or model input.
4. Compare link store, native Session set, DSH Session set, and attachment-object set
   before/after. If DSH creates a Session shell before validating submit, require that its
   archive contains configuration only: no user, request, turn, tool, or assistant event.
5. Retain sanitized UI/test evidence and self-review whether any observation occurs only
   at DSH admission versus independently at Relay/SDK boundaries.

## Expected results

- Required observable: explicit pre-send invalid-image rejection and focused zero-query /
  zero-create / zero-send assertions.
- Forbidden observable: new Claude/link binding, durable attachment object, model-bearing
  DSH event, SDK query, or ambiguous silent drop.
- Presentation expectation: DSH gives an actionable invalid-image error.

## Evidence to retain

- Corrupt fixture bytes/digest and focused test names/results.
- Before/after set/hash comparisons and rejection screenshot.
- No credentials, raw unrelated Sessions, or unrelated native content.

## Result interpretation

- Pass only when UI admission and SDK/adapter tests independently reject before query.
- Fail when corrupt content reaches a model request or is silently accepted/dropped.
- Blocked only when the DSH paste path cannot be exercised or tests cannot execute.
