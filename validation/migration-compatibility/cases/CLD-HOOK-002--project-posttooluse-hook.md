# CLD-HOOK-002 — Project PostToolUse hook

## Traceability

- Primary requirement: `CLD-HOOK-002`
- Backend applicability: `sdk`
- Verification levels: `P`, `L`
- Priority: `P0`

## Objective

Prove a project PostToolUse hook observes exactly one completed fixture call through Relay.

## Method

1. Guard the fixture project state and install a project-source Bash PostToolUse recorder.
2. Run a fresh no-tool control; require no hook record.
3. Run a fresh target with one exact read-only Bash; require one PostToolUse record containing the exact
   tool input and completed exact response/output.
4. Restore/delete project settings and temporary log, hash native transcripts and self-review scope/timing.

## Expected results

- Required observable: zero control records and exactly one target record carrying completed output.
- Forbidden observable: PreToolUse-only data, duplicate/wrong call, sibling/user leakage, fallback or residue.

## Result interpretation

- Pass only when independent hook and native completed-tool evidence agree.
- Fail if the project hook is ignored, duplicated, mis-scoped or lacks completed response evidence.
