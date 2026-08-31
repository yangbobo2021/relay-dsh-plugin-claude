# CLD-TOOL-003 — Read exact content

## Traceability

- Primary requirement: `CLD-TOOL-003`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove that Claude's built-in Read tool can return exact precommitted text-file content in
the selected Workspace without a shell or inferred answer.

## Fixture

- Relative path: `read/tool003-exact.txt`.
- Three lines plus terminal LF; record exact bytes and SHA-256 before run.

## Method

1. In a fresh Session, require the built-in `Read` tool on the exact relative path and
   prohibit Bash, cat, Python, scripts, and alternate file-reading tools.
2. Require exact terminal block:
   `READ_RESULT_BEGIN`, the exact three fixture lines, then `READ_RESULT_END`.
3. Inspect native content for one successful Read with exact path/result and no forbidden
   tool; compare final bytes after stripping only the two wrapper lines.
4. Correlate DSH activity/completion, approvals, Workspace/object equality, and self-review.

## Expected results

- Required observable: real Read result and exact three-line final payload.
- Forbidden observable: shell fallback, guessed marker, added line numbers, whitespace loss,
  tool error, approval, or mutation.

## Result interpretation

- Pass only when tool result and final payload reproduce the file exactly.
- Fail if Read is absent/bypassed or content differs.
- Blocked only for backend/tool infrastructure outage.
