# Self-review

## Process validity

- Both branches use the production client, same SDK binary/model/source list/command, and sibling paths
  under one sanitized fixture parent. Only one project contains `.claude/settings.json`.
- Structured query cwd and native histories prevent accidental execution in the wrong project.

## Result reliability

- Denial/no stdout versus exact stdout is a stronger observable than terminal prompt markers.
- Duplicate denial events share one native tool ID and are counted once. There is no retry or fallback.
- Zero approvals and unchanged user settings isolate project-file scope.

## Verdict

Pass. Shared project settings apply inside the fixture project and do not leak to its sibling.
