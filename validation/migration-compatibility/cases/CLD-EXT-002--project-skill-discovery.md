# CLD-EXT-002 — Project Skill discovery

## Traceability

- Primary requirement: `CLD-EXT-002`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove that a `.claude/skills` fixture is discovered only for the selected project Workspace and
does not leak into a sibling Workspace, while the same user Skill remains global to both.

## Method

1. Install unique `relay-cld-project-skill` only under the tool Workspace's `.claude/skills/` and
   hash it. Retain the already proven user Skill as a cross-Workspace control.
2. Fresh tool-workspace Session: run an unrelated no-tool probe and inspect initial listing for
   both user and project skills, exact project description, selected cwd, and expected count.
3. Fresh sibling plain-text-workspace Session after installation: run a second unrelated no-tool
   probe; require user Skill present but project Skill absent, with sibling cwd and expected count.
4. Confirm both turns complete without tools, restore tool Workspace selection, compare state,
   and self-review source isolation.

## Expected results

- Required observable: tool Workspace initial list has 14 skills including both fixtures; sibling
  has 13 including only user fixture; no explicit invocation is needed.
- Forbidden observable: project Skill missing in project, leaked to sibling, cwd mismatch, listing
  manufactured by prompt/tool use, unrelated mutation, or lost global control Skill.

## Result interpretation

- Pass only when positive and negative scope trials plus cwd/control assertions all pass.
- Fail on missing project discovery or cross-project leakage.
- Blocked only for backend/tool infrastructure outage.
