# CLD-TOOL-001 — Workspace cwd

## Traceability

- Primary requirement: `CLD-TOOL-001`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove that Claude's built-in tool process runs in the exact Workspace selected in DSH.

## Preconditions

- `CLD-FILE-002` is closed.
- Register and select `fixtures/tool-workspace`; record its canonical absolute path.
- Start a fresh Standard/Claude Sonnet/Medium/Workspace Write Session and record link,
  native, DSH Session, attachment-object, and complete Workspace baselines.

## Method

1. Send: `Use Bash to run pwd. Then reply exactly CWD_RESULT=<the exact stdout path> and
   add nothing else.`
2. Allow the read-only Bash call if DSH requests approval.
3. Require one successful Bash tool result and one exact terminal text result.
4. Compare Bash stdout, Claude native `cwd` fields, DSH Session `cwd`, link config `cwd`,
   selected Workspace UI, and expected canonical path byte-for-byte.
5. Assert completed turn, no Workspace/object mutation, then self-review evidence.

## Expected results

- Required observable: all six cwd surfaces equal the selected tool Workspace path.
- Forbidden observable: repository root, plugin directory, home directory, stale Workspace,
  tool failure, inferred path without Bash, or any file/object mutation.

## Result interpretation

- Pass only when the real tool stdout and every persisted configuration surface agree.
- Fail on any cwd mismatch or absent tool execution.
- Blocked only if Workspace registration or backend execution infrastructure is unavailable.
