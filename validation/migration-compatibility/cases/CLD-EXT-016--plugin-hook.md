# CLD-EXT-016 — Plugin Hook

## Traceability

- Primary requirement: `CLD-EXT-016`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove that a PreToolUse hook bundled in a CLI-installed plugin observes exactly its selected Bash
event during a Relay Claude SDK turn without blocking or duplicating the business call.

## Method

1. Record exact user-plugin/settings, temp-log, source, Workspace, object, link, transcript, and
   process baselines; validate/install immutable fixture 1.0.4 and require CLI Hook inventory.
2. Negative branch: fresh unrelated no-tool Session; require no external hook log and exact final.
3. Target branch: fresh Session, one exact read-only Bash command, record whether Relay approval is
   requested, and forbid other tools/fallbacks; require exact stdout/final and one append-only hook
   record with exact `PreToolUse`, `Bash`, command, Session ID, and cwd.
4. Compare installed bytes, native Bash/tool result, DSH approval/lifecycle/final, hook log timing,
   UI/source/state invariants; self-review prompt independence and event/call counts.
5. Uninstall/remove fixture, restore user bytes/paths, archive/delete temp log, and confirm no process
   or configuration remains.

## Expected results

- Required observable: no event for no-tool branch; exactly one external PreToolUse record precedes
  one successful target Bash whose native/DSH/final output is exact; approval behavior is recorded.
- Forbidden observable: user/project hook config, wrong event/tool/command/cwd/Session, duplicate
  event/call, hidden block, unrelated firing/mutation, or leaked log/install/process.

## Result interpretation

- Pass only when positive and negative branches, ordering, execution, and cleanup pass.
- Fail if the plugin Hook is inventoried but does not observe the Relay SDK tool call correctly.
- Blocked only for unrelated Claude service/CLI infrastructure outage.
