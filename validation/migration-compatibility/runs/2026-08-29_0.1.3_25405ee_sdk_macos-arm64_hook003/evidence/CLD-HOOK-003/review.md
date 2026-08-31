# Self-review

## Process validity

- A contemporaneous unconfigured sibling distinguishes project scope from generic SDK startup behavior.
- Session IDs and cwd are recorded independently by the hook and SDK; timestamps establish lifecycle order.
- Both prompts prohibit tools and both activity sets contain zero tools, isolating SessionStart itself.

## Result reliability

- Exactly one positive record, zero negative records and unique terminal markers reject duplication/cross-talk.
- Hook time falls strictly inside the target run and well before terminal completion.
- Native transcript hashes and exact cleanup checks make the outcome reproducible and state-safe.

## Verdict

Pass. Relay's Claude SDK path honors a project SessionStart hook for the correct fresh Session, at the
correct lifecycle point and without firing in an unconfigured sibling.
