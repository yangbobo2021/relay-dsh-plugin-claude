# CLD-EXT-007 — Project MCP

## Traceability

- Primary requirement: `CLD-EXT-007`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove that a project `.mcp.json` STDIO server loads and executes in its owning Workspace while its
tool and process remain absent from a sibling Workspace.

## Method

1. Record absent user/root and sibling MCP controls. Add one temporary tool-workspace `.mcp.json`
   pointing to the immutable project server and isolated append-only run log.
2. In a fresh tool-workspace Claude Session, permit one exact deferred ToolSearch selector and one
   project MCP call with input `CLD_EXT007_PROJECT_STDIO_INPUT_0707`; allow the MCP tool once if
   requested. Require exact independent server call/result/final evidence.
3. In a fresh sibling plain-text-workspace Session, run only the exact ToolSearch selector for the
   project tool and require zero match, zero project MCP call/process delta, and a fixed absence
   final. Do not permit any fallback.
4. Inspect both native deferred-tool deltas, tool results, DSH lifecycles, bindings, source/config
   digests, Workspace/Git/object state, and self-review.
5. Archive evidence, remove only the temporary `.mcp.json`, verify it is absent and all fixture
   processes have exited, then record cleanup before advancing.

## Expected results

- Required observable: exact project business call succeeds in tool-workspace; sibling exact
  discovery returns no project tool and produces no server call; cleanup removes configuration.
- Forbidden observable: root user config dependency, sibling tool exposure, duplicate call,
  fallback, guessed result, source/workspace mutation beyond the temporary config, or leak.

## Result interpretation

- Pass only when positive execution, sibling-negative scoping, exact transport, continuity,
  isolation, and cleanup all pass.
- Fail when project MCP is absent/unusable or visible in the sibling Workspace.
- Blocked only for backend infrastructure outage unrelated to project MCP.
