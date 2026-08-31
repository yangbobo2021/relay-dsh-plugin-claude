# CLD-INS-005 — Imported instructions

## Traceability

- Primary requirement: `CLD-INS-005`
- Backend applicability: `sdk`
- Verification levels: `P`, `L`
- Priority: `P1`

## Objective

Prove a project CLAUDE.md `@` import loads and follows its referenced instruction through Relay.

## Method

1. Configured root CLAUDE.md contains only `@instructions/imported.md`; exact-response marker lives only
   in the referenced file. Sibling has no import.
2. Run identical opaque no-tool queries in fresh project-source Sessions under both cwd values.
3. Require exact imported marker only in configured branch; hash root/import/native records and state.
4. Self-review direct-root leakage and model coincidence.

## Expected results

- Required observable: configured exact imported marker; sibling zero marker.
- Forbidden observable: marker in root/prompt, tool use, broken relative resolution, leak or mutation.

## Result interpretation

- Pass only when import content is the unique source of the marker.
- Fail if ignored, unresolved or leaked.
