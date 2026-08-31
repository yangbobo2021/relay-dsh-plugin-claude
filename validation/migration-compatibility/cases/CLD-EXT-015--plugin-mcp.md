# CLD-EXT-015 — Plugin MCP tool

## Traceability

- Primary requirement: `CLD-EXT-015`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove that an MCP server bundled in a CLI-installed plugin is discovered by fresh Relay Claude SDK
initialization and its namespaced tool can execute exactly once with intact input/result/provenance.

## Method

1. Record exact user-plugin/settings, temp-log, source, Workspace, object, link, transcript, and
   process baselines; validate/install immutable fixture 1.0.3 and require CLI MCP inventory.
2. Fresh unrelated no-tool discovery Session: inspect initial deferred-tool delta to identify exactly
   one plugin MCP tool without naming it in the prompt; require no business server call.
3. Fresh business Session: one exact ToolSearch selector, one exact plugin MCP call with fixed input,
   one allowed-once approval, no retry/fallback, and exact result-grounded final.
4. Compare installed bytes, independent server log, native tool/result/attribution, DSH approval and
   lifecycle, final/UI, source/state/process invariants; self-review initialization noise separately.
5. Uninstall/remove fixture, restore user bytes/paths exactly, confirm server processes exit, archive
   and delete the temporary log.

## Expected results

- Required observable: fresh init exposes one plugin-namespaced MCP tool; one approved business call
  reaches the bundled server with exact input and returns the exact marker through native/DSH/final.
- Forbidden observable: direct project/user MCP config, missing plugin namespace, duplicate business
  call, retry/fallback, result alteration, unapproved bypass, unrelated mutation, or leaked process/log/install.

## Result interpretation

- Pass only when discovery, exact call/result/approval/provenance, and all cleanup checks pass.
- Fail if the plugin loads but its bundled MCP server/tool does not reach Relay SDK.
- Blocked only for unrelated Claude service/CLI infrastructure outage.
