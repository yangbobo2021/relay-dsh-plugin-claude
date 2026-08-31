# CLD-INS-002 — Project CLAUDE.md

## Traceability

- Primary requirement: `CLD-INS-002`
- Backend applicability: `sdk`
- Verification levels: `P`, `L`
- Priority: `P0`

## Objective

Prove a project CLAUDE.md is followed only inside its fixture project through Relay.

## Method

1. Put one opaque-token exact-response rule in configured project's root CLAUDE.md; sibling has none.
2. Run identical no-tool queries in fresh project-source Sessions under each exact cwd.
3. Require exact rule marker only inside configured project and inspect native/query records.
4. Hash fixtures/state and self-review cwd/scoping causality.

## Expected results

- Required observable: project returns exact marker; sibling does not.
- Forbidden observable: expected answer in prompt, tool use, user instruction, cwd leak or mutation.

## Result interpretation

- Pass only when project boundary causes the differential.
- Fail if ignored or leaked to sibling.
