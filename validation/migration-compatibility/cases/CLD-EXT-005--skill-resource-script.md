# CLD-EXT-005 — Skill resource and script

## Traceability

- Primary requirement: `CLD-EXT-005`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove that a loaded user Skill can resolve its own global base directory, read a bundled reference,
run a bundled script, and ground its final in both exact outputs.

## Method

1. Reverify immutable global/canonical Skill, reference, and script digests. In a fresh tool-workspace
   Session explicitly load `relay-cld-user-skill` with a bundled-resource validation request; do not
   put reference, script, or final markers in the user prompt.
2. Permit only Skill, one Read of the global `references/marker.txt`, and one Bash running
   `bash scripts/emit-marker.sh` from the injected global base. Allow Bash once if requested.
3. Require exact final `CLD_EXT005_BUNDLE_OK_0505` only after Read yields
   `CLD_EXT005_REFERENCE_0505` and Bash yields `CLD_EXT005_SCRIPT_0505`.
4. Inspect native injected body/base and all tool outputs, DSH lifecycles/approval/completion, source
   immutability, and state. Self-review, archive evidence, then remove the temporary global fixture
   while retaining the canonical repository copy and recording cleanup.

## Expected results

- Required observable: exact Skill → Read → Bash sequence resolves the global bundle and both exact
  independent markers ground the final; cleanup removes only the temporary global fixture.
- Forbidden observable: prompt contains markers, guessed/fabricated output, wrong/project paths,
  alternate/duplicate tool, modified source, unrelated mutation, cleanup before evidence, or leak.

## Result interpretation

- Pass only when both resource types, base resolution, final, immutability, and cleanup pass.
- Fail on missing/unusable bundled resource/script or ungrounded final.
- Blocked only for backend/tool infrastructure outage.
