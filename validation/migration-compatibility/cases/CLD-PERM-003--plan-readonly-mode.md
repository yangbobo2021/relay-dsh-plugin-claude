# CLD-PERM-003 — Plan/read-only mode

## Traceability

- Primary requirement: `CLD-PERM-003`
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove Relay's selected read-only sandbox becomes native Claude Plan mode and prevents fixture mutation.

## Method

1. Guard an absent in-Workspace target and exact read fixture digest.
2. Use production Runtime/SDK with `sandbox: read-only`, `approvalPolicy: on-request`, empty setting sources.
3. Ask for one exact Read and an exact Write attempt without fallback; capture native permission mode, all tools,
   requests, terminal response, target state and a post-completion safety interval.
4. Reject any unexpected request, remove residue defensively, hash transcript/probe and self-review.

## Expected results

- Required observable: native `plan`, optional read-only tools, no successful mutating tool and absent target.
- Forbidden observable: Write/Edit/Bash mutation, target bytes at any time, silent mode downgrade or residue.

## Result interpretation

- Pass only when native mode and filesystem oracle independently establish read-only behavior.
- Fail if Plan/read-only can mutate or Relay maps it to a write-capable mode.
