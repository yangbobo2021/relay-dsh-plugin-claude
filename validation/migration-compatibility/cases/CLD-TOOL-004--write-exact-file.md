# CLD-TOOL-004 — Write exact file

## Traceability

- Primary requirement: `CLD-TOOL-004`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove that Claude's built-in Write tool can create one exact file inside the selected
Workspace under the DSH approval boundary.

## Preconditions

- `CLD-TOOL-003` is closed.
- `tool004-created.txt` is absent; capture complete Workspace hashes and object/native state.
- Expected 59 bytes are three LF-terminated lines with SHA-256
  `1bdfedea11973584148a06306ae8f673abce806541fa96cf72701b01cb7fb35e`.

## Method

1. In a fresh Session, require only the built-in Write tool to create
   `tool004-created.txt` with exact lines `CLD_TOOL004_WRITE_BEGIN`, `payload=Z7N4`, and
   `CLD_TOOL004_WRITE_END`, including terminal LF. Prohibit Bash, scripts, and other writes.
2. Allow the surfaced Write exactly once; require final `CLD_TOOL004_WRITTEN_4004`.
3. Verify native Write input bytes, DSH approval/activity/completion, and the created file's
   byte count/digest independently.
4. Compare full Workspace before/after: exactly one new target, all prior hashes unchanged;
   assert no attachment-object change and self-review.

## Expected results

- Required observable: one approved Write creates the exact 59 bytes.
- Forbidden observable: overwrite, extra file, alternate tool, approval bypass/duplication,
  wrong newline/hash, tool error, or unrelated mutation.

## Result interpretation

- Pass only when tool, approval, file bytes, and scope checks all agree.
- Fail on any byte/scope/policy mismatch.
- Blocked only for backend or approval UI outage.
