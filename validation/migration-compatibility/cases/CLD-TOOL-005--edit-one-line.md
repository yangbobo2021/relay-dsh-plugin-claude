# CLD-TOOL-005 — Edit one line

## Traceability

- Primary requirement: `CLD-TOOL-005`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove that Claude's built-in Edit changes only one exact target line under approval while
preserving every surrounding byte and unrelated Workspace file.

## Fixture

- Relative path: `edit/tool005-target.txt`; 51 bytes with terminal LF.
- Before SHA-256: `cfb4511fa0067198081c184bc0c73d02932fd1fb8835d0a2d38cd1c0035e382b`.
- Expected after: replace only `status=before` with `status=after`; 50 bytes, SHA-256
  `fe2ca2a167d5b34712cc7a599543ed467964a6be8090ab3c9f5f5422846a885c`.

## Method

1. Capture complete Workspace hashes. In a fresh Session require built-in Edit with exact
   old/new strings; permit an optional read-only Read preflight, but prohibit Write, Bash,
   scripts, and any alternate mutation tool.
2. Allow the one Edit exactly once and require final `CLD_TOOL005_EDITED_5005`.
3. Inspect native Edit input/result and DSH approval/activity/completion.
4. Verify byte count, digest, exact one-line diff, unchanged surrounding lines, no new/
   missing files, all unrelated hashes unchanged, and no attachment-object change.
5. Self-review before closing.

## Expected results

- Required observable: one approved Edit produces the exact after digest.
- Forbidden observable: whole-file Write, alternate mutation tool, multiple replacement, approval
  bypass/duplication, unrelated mutation, newline loss, or tool failure.

## Result interpretation

- Pass only when tool, approval, exact diff, and scope all agree.
- Fail on any method/content/scope/policy mismatch.
- Blocked only for backend or approval UI outage.
