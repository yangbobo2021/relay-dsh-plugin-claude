# CLD-ENV-001 — PATH and executable discovery

## Traceability

- Primary requirement: `CLD-ENV-001`
- Backend applicability: `sdk`
- Verification levels: `P`, `L`
- Priority: `P0`

## Objective

Prove a project-configured PATH reaches Claude's real Bash process and discovers a fixture executable.

## Method

1. Guard project settings and use an immutable executable with a unique name outside the baseline PATH.
2. Temporarily set project `env.PATH` to fixture bin plus the host PATH.
3. Run the exact executable command once with project source; require exact stdout and exit success.
4. Run the same command once with no setting sources; require command-not-found/failure, then cleanup and review.

## Expected results

- Required observable: configured success/exact marker versus unconfigured missing executable.
- Forbidden observable: absolute-path fallback, different command, global PATH mutation or project residue.

## Result interpretation

- Pass only when the setting-source differential explains discovery.
- Fail if Relay drops PATH or discovery requires a workaround.
