# CLD-SES-001 — New Session binding

## Traceability

- Primary requirement: `CLD-SES-001`
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove a new live DSH Claude Code conversation creates exactly one durable business Claude binding.

## Method

1. Record link-store hash/count and live DSH/Claude session baselines.
2. Through the real browser UI, create a new Session, explicitly select Claude Code, use exact Workspace/model,
   send a unique no-tool prompt and require one exact visible final.
3. Diff link entries; map the new DSH Session to native Claude transcript and DSH archive.
4. Distinguish any title/auxiliary native Session from the business link; self-review invalid pre-binding shells.

## Expected results

- Required observable: exactly one new business mapping and matching completed archive/native/final.
- Forbidden observable: zero/multiple business mappings, auxiliary binding, wrong cwd or incomplete turn.

## Result interpretation

- Pass only when one durable link owns the visible business turn.
- Fail if new conversations cannot bind deterministically.
