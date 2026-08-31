# CLD-PERM-002 — Outside-Workspace access

## Traceability

- Primary requirement: `CLD-PERM-002`
- Backend applicability: `sdk`
- Verification levels: `P`, `L`
- Priority: `P0`

## Objective

Prove real Claude access outside Relay's selected Workspace cannot occur silently.

## Method

1. Create one guarded sanitized file under `/private/tmp`, outside the exact fixture cwd.
2. With production Runtime `workspace-write/on-request`, request an exact absolute Read and decline its
   approval; require failed Read and no outside marker in tool/final output.
3. In a fresh identical Session accept the outside Read approval; require exact content once.
4. Capture request path/reason/mode/native evidence, remove the temp file, and self-review leakage/residue.

## Expected results

- Required observable: explicit approval for both outside Reads; deny hides bytes, allow returns exact bytes.
- Forbidden observable: silent access, marker leakage after denial, fallback, mutation or temp residue.

## Result interpretation

- Pass only when the outside boundary is explicit and both decisions are enforced.
- Fail if outside data is read without approval or despite denial.
