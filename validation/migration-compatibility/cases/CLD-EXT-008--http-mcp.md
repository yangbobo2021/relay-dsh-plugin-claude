# CLD-EXT-008 — HTTP MCP

## Traceability

- Primary requirement: `CLD-EXT-008`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P1`

## Objective

Prove that the Claude plugin connects to a loopback Streamable HTTP MCP server and completes one
exact namespaced call without falling back to STDIO or another tool.

## Method

1. Verify port `47891` is unused, start the immutable server bound only to `127.0.0.1`, require its
   ready marker and health response, and install one temporary project HTTP MCP entry.
2. In a fresh tool-workspace Claude Session, permit one exact deferred ToolSearch selector and one
   `echo_http_transport` call with input `CLD_EXT008_HTTP_INPUT_0808`; allow the MCP call once if
   requested. Do not put the output prefix in the prompt.
3. Require exact HTTP initialize/list/call evidence in the independent log, one business call,
   exact native/DSH result `CLD_EXT008_HTTP_OUTPUT_0808:CLD_EXT008_HTTP_INPUT_0808`, MCP attribution,
   and exact grounded final.
4. Inspect DSH/native lifecycle, binding, config/source/state digests, and self-review. Archive all
   evidence, stop the server, require a shutdown marker and closed port, then remove the temporary
   project config and confirm cleanup before advancing.

## Expected results

- Required observable: loopback HTTP server is connected and receives exactly one business call;
  independent HTTP, native, DSH, and final evidence agree; shutdown and cleanup succeed.
- Forbidden observable: STDIO process for this fixture, non-loopback bind, duplicate/fallback call,
  guessed result, unrelated mutation, lingering listener/config, or leak.

## Result interpretation

- Pass only when connection, HTTP transport, exact call/result, continuity, state, shutdown, and
  cleanup all pass.
- Fail when HTTP MCP is absent/unusable or result transport is incorrect.
- Blocked only for an unrelated port/runtime outage after safe alternatives are exhausted.
