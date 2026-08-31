# CLD-EXT-003 Observations

- User prompt names the Skill but never contains its manual-result marker. Native content contains
  exactly one `Skill` with the exact user name, success result, then the unique marker final.
- Focused pre-run search finds the marker only in the installed user SKILL.md; the project Skill
  and all other allowed inputs lack it. DSH mirrors one Skill start/completion and completed turn.
- After the launch acknowledgment, native JSONL persists an injected user context with the exact
  global base directory and full fixture body, followed by the marker final.
- Workspace/Git/object state remains unchanged.
