# CLD-EXT-001 — User Skill discovery

## Traceability

- Primary requirement: `CLD-EXT-001`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove that a newly installed user-scoped Claude Skill is automatically discovered in a fresh SDK
Session independently of project files or explicit Skill invocation.

## Method

1. Prove the unique user Skill name is absent from a prior fresh Session's `skill_listing`; install
   sanitized fixture `relay-cld-user-skill` under `~/.claude/skills/` and retain a byte-identical
   canonical copy under validation fixtures. Capture all digests.
2. Start a fresh Claude Code Session in the existing tool Workspace and ask for an unrelated exact
   no-tool discovery probe, so no Skill invocation can manufacture discovery evidence.
3. Inspect the native initial `skill_listing` attachment for exact name, count delta, description,
   and user source/path where exposed; confirm the business Session completes the no-tool probe.
4. Assert project/Workspace/object state is otherwise unchanged and self-review. Retain the global
   fixture only through `CLD-EXT-005`, then clean it up explicitly.

## Expected results

- Required observable: fresh Session initial metadata lists `relay-cld-user-skill` while the prior
  Session did not; no Skill/tool invocation is needed.
- Forbidden observable: name only echoed from prompt, discovery only after explicit invocation,
  project-local source, duplicate fixture, unrelated configuration change, or missing listing.

## Result interpretation

- Pass only with native initial-listing evidence and source isolation.
- Fail when user setting source does not expose the fixture to the SDK Session.
- Blocked only for backend/tool infrastructure outage.
