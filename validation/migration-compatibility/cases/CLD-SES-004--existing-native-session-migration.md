# CLD-SES-004 — Existing native Session migration

## Traceability

- Primary requirement: `CLD-SES-004`
- Backend applicability: `sdk`, `cli`
- Verification levels: `P`, `W`
- Priority: `P0`

## Objective

Determine whether a pre-existing native Claude Session can be imported/bound into a new DSH conversation.

## Method

1. Select a real completed native Claude Session that is absent from the live Relay link store.
2. Inspect the live new-Session UI for native Session ID/import/resume controls.
3. Inspect public DSH capability, adapter/link-store APIs and create/resume path; distinguish backend-native resume
   from a user-facing DSH import/bind operation.
4. Record explicit supported path or explicit gap, without manually editing private link state; self-review.

## Expected results

- Required observable: supported import continues exact source ID, or an evidence-backed explicit gap is recorded.
- Forbidden observable: claiming support from internal `resumeSession` alone or manual link-file editing.

## Result interpretation

- Supported only if a product/API entry accepts an external native Session ID.
- Validation passes as an explicit-gap result when absence is proven; capability remains **unsupported**.
