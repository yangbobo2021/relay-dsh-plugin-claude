# CLD-EXT-014 — Plugin Agent

## Traceability

- Primary requirement: `CLD-EXT-014`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P1`

## Objective

Prove that a CLI-installed plugin Agent is namespaced in fresh SDK initialization and can run as one
foreground child whose exact result returns to and completes the Relay parent Session.

## Method

1. Record exact user-plugin/settings, source, Workspace, object, link, transcript, and child-file
   baselines; validate/install immutable fixture version 1.0.2 and require CLI Agent inventory.
2. Fresh Relay Session: require one `Agent` call with exact namespaced `subagent_type`, fixed prompt,
   fixed description, and `run_in_background: false`; forbid any other parent or child tool/fallback.
3. Require initial Agent listing, native parent tool/result, depth-1 child transcript/meta, exact cwd,
   zero child tools, body-only child marker, matching agent/tool IDs, and exact parent final.
4. Compare native, DSH lifecycle, UI, install/source/state invariants; self-review identity, foreground
   semantics, and child attribution.
5. Uninstall/remove fixture and restore all pre-run user bytes/paths exactly.

## Expected results

- Required observable: one namespaced plugin Agent creates one foreground depth-1 child with exact
  fixture marker; parent receives it through the same Agent call and completes exactly.
- Forbidden observable: general-purpose fallback, wrong namespace/cwd/depth, background run, child
  tool use, missing child record, retry, unrelated mutation, or leaked installation.

## Result interpretation

- Pass only when discovery, parent call, child execution/evidence, result propagation, and cleanup pass.
- Fail if the Agent is listed but cannot be called or its child/result identity is lost.
- Blocked only for unrelated Claude service/CLI infrastructure outage.
