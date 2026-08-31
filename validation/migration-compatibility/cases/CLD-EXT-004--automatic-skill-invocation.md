# CLD-EXT-004 — Automatic Skill invocation

## Traceability

- Primary requirement: `CLD-EXT-004`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P1`

## Objective

Prove that the initial Skill catalog description causes Claude to automatically load the matching
user Skill when the prompt contains only its trigger, without naming the Skill or output marker.

## Method

1. Reverify immutable fixture/listing. In a fresh tool-workspace Session send only a configured
   fixture request containing `CLD_EXT004_AUTO_TRIGGER_0404`; do not mention Skill, the fixture name,
   any tool, or result marker.
2. Wait for exact Skill-only marker `CLD_EXT004_AUTO_SKILL_0404`.
3. Inspect native order for initial listing, one automatically selected Skill input/result, exact
   final, DSH lifecycle, owning binding, and completion. Prove result marker exists only in user
   SKILL.md before the turn and not in prompt/project Skill.
4. Assert no other tool/state mutation and self-review automatic-versus-manual causality.

## Expected results

- Required observable: matching trigger causes one Skill call for `relay-cld-user-skill`; its body
  grounds the unique exact final.
- Forbidden observable: prompt names Skill/tool/result, no Skill call, wrong/project Skill, model
  fabricates marker, duplicate/other tool, mutation, or failed turn.

## Result interpretation

- Pass only when trigger-only prompt, automatic call, source-isolated marker, and final all pass.
- Fail when discovery does not lead to automatic invocation or result is ungrounded.
- Blocked only for backend/tool infrastructure outage.
