# CLD-EXT-003 — Manual Skill invocation

## Traceability

- Primary requirement: `CLD-EXT-003`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove that an explicit user request can manually load the discovered user Skill through Claude's
Skill tool and execute its unique instruction.

## Method

1. Reverify immutable user fixture digest and fresh business listing. In a fresh tool-workspace
   Session explicitly require Skill exactly once with `skill: relay-cld-user-skill`; forbid all
   other tools and do not put the fixture's manual-result marker in the user prompt.
2. Wait for exact final `CLD_EXT003_MANUAL_SKILL_0303` required only by the loaded Skill.
3. Inspect native Skill input/result for exact name and success, tool count, final ordering, DSH
   lifecycle, owning binding, and completion. Prove the unique marker is absent from the user
   prompt/project Skill and exists only in the installed user Skill and post-invocation final.
4. Assert no project Skill/other tool or state mutation and self-review against model-memory echo.

## Expected results

- Required observable: one real Skill tool loads the exact user fixture and its instructions ground
  the unique final marker.
- Forbidden observable: marker in user prompt, no Skill call, wrong/project Skill, duplicate/other
  tool, fabricated marker, mutation, detached Session, or failed turn.

## Result interpretation

- Pass only when tool invocation/result and unique final both pass.
- Fail on missing/unavailable Skill tool, wrong source, or ungrounded output.
- Blocked only for backend/tool infrastructure outage.
