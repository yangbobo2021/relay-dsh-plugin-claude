# CLD-CFG-002 — Shared project settings

## Traceability

- Primary requirement: `CLD-CFG-002`
- Backend applicability: `sdk`
- Verification levels: `P`, `L`
- Priority: `P0`

## Objective

Prove that shared `.claude/settings.json` is effective only inside its fixture project through Relay.

## Method

1. Create sibling sanitized projects; only `shared-project` contains a project setting denying one exact
   read-only Bash `printf` command.
2. Run one fresh real SDK Session in each cwd with `settingSources: ["project"]` and identical prompts.
3. Require one denial/no stdout inside the configured project and exact stdout in the sibling.
4. Compare query cwd/source, native histories, fixture hashes and state; self-review scope causality.

## Expected results

- Required observable: configured project denies; sibling executes the exact same command.
- Forbidden observable: user/local source, path leakage, broad command, mutation, fallback or prompt-only pass.

## Result interpretation

- Pass only when the cwd differential proves project-only scope.
- Fail if the setting is ignored or affects the sibling.
