# CLD-CFG-004 — Settings precedence

## Traceability

- Primary requirement: `CLD-CFG-004`
- Backend applicability: `sdk`
- Verification levels: `P`, `L`
- Priority: `P0`

## Objective

Prove the effective user < project < local precedence for one conflicting setting through Relay.

## Method

1. Give one environment key distinct `USER_4004`, `PROJECT_4004`, and `LOCAL_4004` values in guarded
   user, shared project, and project-local settings.
2. Run three fresh real SDK Sessions in one fixture cwd using sources user-only, user+project, and all.
3. Print the same variable once per Session and require exact USER, PROJECT, LOCAL stdout in order.
4. Restore real user settings byte-exactly; compare query sources, transcripts and state; self-review.

## Expected results

- Required observable: `USER_4004`, then `PROJECT_4004`, then `LOCAL_4004`.
- Forbidden observable: source omission/reordering effect, prompt-only value, mutation, fallback or config leak.

## Result interpretation

- Pass only when all three controlled branches establish the full chain.
- Fail on any unexpected winning source or incomplete restoration.
