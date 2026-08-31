# CLD-INS-004 — Nested CLAUDE.md

## Traceability

- Primary requirement: `CLD-INS-004`
- Backend applicability: `sdk`
- Verification levels: `P`, `L`
- Priority: `P0`

## Objective

Prove a nested CLAUDE.md loads when work accesses its directory and does not apply to root-only work.

## Method

1. Put an opaque-token exact-response instruction only in `nested/CLAUDE.md`.
2. Matching fresh Session reads `nested/target.txt` once then asks the opaque query.
3. Root-control Session reads `root-control.txt` once with the identical query.
4. Require marker only after nested access, exact Read evidence, no mutation and self-review.

## Expected results

- Required observable: nested access returns marker; root-only control does not.
- Forbidden observable: root CLAUDE.md, expected answer in prompt/files, extra tools, leak or mutation.

## Result interpretation

- Pass only when directory access causes the differential.
- Fail if nested instruction is ignored or globally applied.
