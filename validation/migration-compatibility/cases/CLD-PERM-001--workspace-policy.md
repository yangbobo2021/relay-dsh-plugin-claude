# CLD-PERM-001 — Workspace read/write policy

## Traceability

- Primary requirement: `CLD-PERM-001`
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove Relay propagates the effective on-request Workspace policy to real Claude Read/Write calls.

## Method

1. Use production `ClaudeSessionRuntime` + `ClaudeSdkClient`, explicit `workspace-write` and `on-request`,
   empty setting sources, exact absent target guards and a read fixture digest.
2. Allow branch: require one exact Read and one exact Write; accept each emitted approval and verify target bytes.
3. Deny branch: require one exact Write; decline its emitted approval and prove target remains absent.
4. Capture runtime/SDK/native evidence and actual SDK permission mode; remove validation targets and self-review.

## Expected results

- Required observable: `default` native permission mode, allowed exact write, denied absent write, explicit decisions.
- Forbidden observable: policy bypass, wrong/outside path, alternate mutation, missing request or residue.

## Result interpretation

- Pass only when both positive and negative policy branches agree at every layer.
- Fail if a denied write occurs or effective DSH policy is not represented/enforced.
