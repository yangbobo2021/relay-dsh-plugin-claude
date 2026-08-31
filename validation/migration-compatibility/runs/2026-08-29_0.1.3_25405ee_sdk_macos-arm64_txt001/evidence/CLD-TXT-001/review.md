# CLD-TXT-001 Validation Review

## Reasonableness

- A fresh isolated DSH/link environment prevents an existing Claude Session or cached
  answer from satisfying the case.
- Exact response syntax and no-tool instruction make the terminal observable deterministic.
- The machine-readable assistant message, link store, immutable archive, Workspace
  manifest, and visible UI test different layers of the product path.

## Reliability

- DSH and the persisted archive each show one completed turn and one terminal text block.
- Provider/model/Claude Session identifiers in the archive agree with the sole link record
  and visible `Claude Code` / `Claude Haiku Low` UI state.
- Zero tool events plus an unchanged single-file Workspace exclude hidden mutation/tool
  fallback. The screenshot was visually reviewed at original resolution.
- The thinking summary mentions the requested marker, but it is rendered in a distinct
  `reasoning` block; it is not a second terminal answer.

## Limitations

- This case proves the SDK backend only, on one authenticated macOS arm64 environment.
- The formal run uses the standard authenticated Claude root because an empty isolated
  root has no login. No credentials or configuration contents were inspected or retained.

## Verdict

**Pass, high confidence.** A fresh DSH Claude Code Session produces exactly one persisted,
non-duplicated terminal answer through the live Agent SDK with the expected binding and
without a tool call or Workspace mutation.
