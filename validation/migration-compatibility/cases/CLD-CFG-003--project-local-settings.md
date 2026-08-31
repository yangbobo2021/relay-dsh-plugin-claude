# CLD-CFG-003 — Project-local settings

## Traceability

- Primary requirement: `CLD-CFG-003`
- Backend applicability: `sdk`
- Verification levels: `P`, `L`
- Priority: `P0`

## Objective

Prove that `.claude/settings.local.json` overrides the shared project value through Relay's SDK path.

## Method

1. In one isolated fixture project set `CLD_CFG003_PRECEDENCE=SHARED_3003` in shared settings and
   `LOCAL_3003` in local settings.
2. Fresh Session with `settingSources: ["project", "local"]`: print the value exactly once.
3. Independent project-only control Session prints the same variable with `settingSources: ["project"]`.
4. Require exact `LOCAL_3003` versus `SHARED_3003`, captured query sources/cwd and unchanged state.

## Expected results

- Required observable: local-enabled returns local; project-only returns shared.
- Forbidden observable: user source, prompt echo substituted for Bash output, mutation, fallback or leak.

## Result interpretation

- Pass only when the controlled source differential proves local override.
- Fail if local is ignored or applies when excluded.
