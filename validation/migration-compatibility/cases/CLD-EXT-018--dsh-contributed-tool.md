# CLD-EXT-018 — DSH-contributed tool

## Traceability

- Primary requirement: `CLD-EXT-018`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P1`

## Objective

Prove that a read-only tool advertised by DSH crosses Relay's in-process Claude SDK MCP bridge,
executes once in DSH, and returns its real result to native Claude and the completing Session.

## Method

1. Record Workspace, DSH/Claude links, native transcripts, object/state/source baselines, and the
   current DSH-contributed initial tool list; choose read-only no-argument `CronList`.
2. Fresh Relay Session: one exact ToolSearch for `CronList`, then one invocation of the returned DSH
   tool with no arguments; forbid any other tool, retry, fallback, or mutation.
3. Require initial advertisement, selector result, one native MCP call/result, one matching DSH tool
   execution result, completed Relay Claude lifecycle, and exact success/failure classification final.
4. Compare names/arguments/call IDs/results across native SDK bridge and DSH records; inspect state,
   source and object invariants; self-review empty-list semantics and prompt-derived final separately.

## Expected results

- Required observable: advertised `CronList` resolves to the in-process DSH MCP bridge, executes once,
  and its non-error result is present in native and DSH evidence before a completed exact final.
- Forbidden observable: external/plugin MCP substitute, missing schema, retry/fallback, approval meant
  for an external tool, result loss/alteration, mutation, or leak.

## Result interpretation

- Pass only when live advertised schema, exact bridge call/result, DSH execution, continuity and state pass.
- Fail if DSH advertises the tool but Relay's SDK MCP bridge cannot execute or return it.
- Blocked only if DSH does not advertise any safe read-only tool in the active profile.
