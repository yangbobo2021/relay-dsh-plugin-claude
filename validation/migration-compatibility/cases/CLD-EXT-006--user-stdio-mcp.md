# CLD-EXT-006 — User STDIO MCP

## Traceability

- Primary requirement: `CLD-EXT-006`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove that the Claude plugin loads a user-scoped STDIO MCP server, starts its real process, exposes
its tool, transports one exact argument/result, and keeps the owning DSH turn usable.

## Method

1. Record the pre-test user-config digest and absence of the fixture server. Add one temporary
   root user `mcpServers.relay_cld_user_stdio` entry pointing at the immutable canonical server and
   an isolated append-only run log; do not alter project MCP configuration.
2. In a fresh tool-workspace Claude Session, request exactly one `echo_user_scope` call with input
   `CLD_EXT006_USER_STDIO_INPUT_0606`; do not put the output prefix or final result in the prompt.
3. Permit one exact deferred ToolSearch selector if the MCP schema is lazy-loaded, then allow only
   the fixture MCP business tool if approval is requested. Require at least one server process and
   transport connection, exactly one business call log, exact MCP result
   `CLD_EXT006_USER_STDIO_OUTPUT_0606:CLD_EXT006_USER_STDIO_INPUT_0606`, and an exact grounded final.
4. Inspect native initial MCP status/tool definition, tool use/result, DSH activity/approval/turn,
   binding, fixture/config digests, Workspace/Git/object state, and self-review.
5. Archive evidence, remove only the temporary user MCP entry, verify that key is absent and the
   server has stopped, then record cleanup before advancing. Record rather than overwrite any
   normal Claude-owned cache rewrite of the broader user JSON.

## Expected results

- Required observable: user STDIO server is connected, its namespaced business tool executes once,
  independent process log and native/DSH records agree, exact output grounds the final, and cleanup
  removes the temporary user configuration semantically.
- Forbidden observable: project config dependency, no real process/call, fallback tool, duplicate
  call, guessed output, config/source/workspace mutation, lingering server, or unrelated leak.

## Result interpretation

- Pass only when discovery, process lifecycle, call transport, exact result, continuity, isolation,
  and cleanup all pass.
- Fail on absent/unusable user STDIO MCP or incorrect/duplicated transport.
- Blocked only for backend infrastructure outage unrelated to MCP configuration.
