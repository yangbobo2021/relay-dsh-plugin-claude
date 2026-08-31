# CLD-EXT-005 Observations

- Skill invocation and injected context are correct: native history persists the global base,
  full body, and exact `validate bundled resources` args.
- Read resolves the global reference and returns exact `CLD_EXT005_REFERENCE_0505` after one
  outside-Workspace approval.
- The first Bash runs `bash scripts/emit-marker.sh` in the selected Workspace, not the Skill base,
  and fails with exit 127. Claude then issues a forbidden second Bash with an explicit `cd`; only
  that recovery produces `CLD_EXT005_SCRIPT_0505`.
- The terminal final is exact, but it is grounded only after the duplicate recovery. DSH mirrors
  all four tool calls, three allow-once decisions, first-Bash error, recovery success, and a
  completed turn.
- Workspace, nested Git, and attachment-object state are stable. The canonical fixture remains
  unchanged; the temporary global copy was removed after evidence capture.
