# CLD-IMG-010 — Image editing

## Traceability

- Primary requirement: `CLD-IMG-010`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P1`

## Objective

Prove that Claude can use its available local tools to create a deterministic edited PNG
copy while preserving the source image and every unrelated Workspace file.

## Preconditions

- `CLD-IMG-009` is closed; use the immutable `generated-img006.png` as source.
- Source is 320x200 RGB: `#ff00aa` outside the bottom-right quadrant and `#00ccff`
  inside x=160..319, y=100..199. `edited-img010.png` and helper files are absent.
- Record complete Workspace, attachment-object, native-session, and link baselines.

## Method

1. In one fresh Session, ask Claude to create `edited-img010.png` by replacing every
   source `#ff00aa` pixel with `#22c55e` while preserving every `#00ccff` pixel, dimensions,
   and RGB encoding. Allow required in-Workspace tools and require helper cleanup.
2. Require exact terminal marker `CLD_IMG010_EDITED_1010` without a file path so artifact
   promotion is not conflated with editing.
3. Independently decode both PNGs. Assert source samples/digest unchanged, target samples
   green/cyan at the exact boundary, dimensions 320x200, and no third color.
4. Compare complete Workspace before/after: exactly one new target file and no changed or
   leftover helper file. Correlate approvals, tool results, link/native/DSH completion,
   object-store equality, and visible terminal marker.
5. Self-review whether the evidence proves a true edit rather than source overwrite or a
   merely renamed copy.

## Expected results

- Required observable: one valid new PNG with exact green/cyan edit and unchanged source.
- Forbidden observable: source mutation, wrong dimensions/color boundary, target identical
  to source, unrelated changes, helper residue, network use, or unapproved write.
- Presentation expectation: one exact terminal marker and completed turn.

## Evidence to retain

- Before/after Workspace hashes, decoded image metadata/colors, and exact file delta.
- Sanitized tool/approval/session correlation, object-store delta, and final screenshot.
- No private data, raw unrelated Sessions, or unnecessary image payloads.

## Result interpretation

- Pass only when the independent pixel and scope checks all succeed.
- Fail on any source/unrelated mutation or if the target does not match the exact edit.
- Blocked only if no permitted local image-editing path can produce the fixture result.
