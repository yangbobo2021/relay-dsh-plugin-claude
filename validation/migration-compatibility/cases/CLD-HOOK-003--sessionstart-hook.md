# CLD-HOOK-003 — SessionStart hook

## Traceability

- Primary requirement: `CLD-HOOK-003`
- Backend applicability: `sdk`
- Verification levels: `P`, `L`
- Priority: `P1`

## Objective

Prove a project lifecycle hook records the correct fresh Claude Session start through Relay.

## Method

1. Guard/create project settings with a SessionStart recorder and clear its temporary log.
2. Run an unconfigured sibling fresh Session as a negative control; require no record.
3. Run one configured-project fresh Session with no tools; require one SessionStart record whose Session ID
   and cwd match the real Session and whose timestamp precedes terminal completion.
4. Remove settings/log, hash transcripts/fixtures, and self-review scope, cardinality and timing.

## Expected results

- Required observable: zero sibling records and exactly one configured SessionStart record.
- Forbidden observable: wrong lifecycle/cwd/Session, duplicates, tool dependency or residual state.

## Result interpretation

- Pass only if independent lifecycle and native/SDK Session evidence agree.
- Fail if lifecycle hooks are ignored, duplicated or cross project scope.
