# CLD-INS-001 — User CLAUDE.md

## Traceability

- Primary requirement: `CLD-INS-001`
- Backend applicability: `sdk`
- Verification levels: `P`, `L`
- Priority: `P0`

## Objective

Prove user `~/.claude/CLAUDE.md` instructions reach a fresh Relay Claude Session and change its response.

## Method

1. Confirm the user file is absent, then create a sanitized temporary rule requiring one exact response
   only for opaque prompt token `CLD_INS001_QUERY`.
2. Fresh user-source Session submits the opaque query with no expected answer in the prompt.
3. Delete the user file, then run an independent source-disabled control with the identical query.
4. Require exact rule response only in user branch; capture native memory attachment/source options and
   cleanup absence; self-review model coincidence risk.

## Expected results

- Required observable: user branch exactly `CLD_INS001_USER_RULE_10001`; control differs.
- Forbidden observable: expected marker in prompt, tool use, persistent user file, source leak or mutation.

## Result interpretation

- Pass only when instruction attachment and controlled response differential agree.
- Fail if user instruction is ignored or leaks into control.
