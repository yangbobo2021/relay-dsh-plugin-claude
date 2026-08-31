# CLD-TOOL-006 — Multi-file edit

## Traceability

- Primary requirement: `CLD-TOOL-006`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove that one Claude task can apply exact targeted changes to two files while preserving
every other Workspace file and respecting each approval.

## Fixtures

- `multi/tool006-a.txt`: replace `value=A_before` with `value=A_after`.
  Before/after SHA-256: `96abf0ca...d8597` / `05bc2c6f...9be9`.
- `multi/tool006-b.txt`: replace `value=B_before` with `value=B_after`.
  Before/after SHA-256: `6c6ae6ba...f3a2` / `e7cb0eaa...7759`.
- Both have unique surrounding lines and terminal LF; retain full digests in evidence.

## Method

1. Capture the complete Workspace manifest/hashes. In a fresh Session require built-in
   Edit on both exact paths and old/new pairs; optional Read is allowed, alternate mutation
   tools are prohibited.
2. Allow each surfaced Edit once. Require final `CLD_TOOL006_MULTI_EDITED_6006` only after
   both succeed.
3. Verify native sequence/results and DSH approvals/activities/completion.
4. Independently verify both exact after digests/diffs, same file set, every unrelated hash
   unchanged, no attachment objects, then self-review.

## Expected results

- Required observable: both targeted files reach exact after states in one completed task.
- Forbidden observable: partial success, wrong/multiple replacements, Write/Bash/script
  mutation, missing/extra approval, added/deleted file, unrelated hash change, or tool error.

## Result interpretation

- Pass only when both mutations and global scope checks pass.
- Fail on partial or out-of-scope mutation even if final text claims success.
- Blocked only for backend or approval UI outage.
