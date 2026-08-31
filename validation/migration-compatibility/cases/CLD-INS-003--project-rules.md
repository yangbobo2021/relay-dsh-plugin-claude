# CLD-INS-003 — Project rules

## Traceability

- Primary requirement: `CLD-INS-003`
- Backend applicability: `sdk`
- Verification levels: `P`, `L`
- Priority: `P0`

## Objective

Prove a path-scoped `.claude/rules` instruction applies for matching work and not for nonmatching work.

## Method

1. Add one rule with `paths: ["src/**"]` and an opaque-token exact response; create matching
   `src/target.txt` and nonmatching `docs/other.txt`.
2. Fresh matching Session reads target exactly once then submits the opaque query.
3. Independent nonmatching Session reads other exactly once with the identical query.
4. Require marker only for matching branch, exact Read inputs/results, no mutation and self-review.

## Expected results

- Required observable: matching branch exact rule marker; nonmatching branch zero marker.
- Forbidden observable: expected answer in prompt, wrong file, broad read, rule leak, fallback or mutation.

## Result interpretation

- Pass only when path applicability and response differential agree.
- Fail if ignored or applied outside its glob.
