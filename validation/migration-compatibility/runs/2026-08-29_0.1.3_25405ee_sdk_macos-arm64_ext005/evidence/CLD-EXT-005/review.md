# CLD-EXT-005 Validation Review

## Reasonableness

- Independent reference/script markers, a marker-free prompt, immutable digests, and exact native
  tool outputs distinguish actual bundle use from guessed final text.
- The method requires one Bash because a migrated Skill should be able to follow its own explicit
  base-directory instruction without trial-and-error. A failed call plus retry is observable user
  cost and cannot be accepted as the requested one-shot behavior.

## Reliability

- Native history proves the injected base and both Bash commands; DSH independently records the
  first error, duplicate lifecycle, and three approvals. The final screenshot agrees with the
  persisted terminal result.
- Approving the second call was evidence collection only. It does not erase the prior exit 127 or
  satisfy the forbidden-observable rule. Source/state hashes and post-capture cleanup rule out a
  fixture mutation explanation.

## Verdict

**Fail, high confidence.** Bundled reference resolution works, but the relative bundled script is
not reliably executed from the injected Skill base in one call; Claude required a failed attempt
and a forbidden recovery Bash.
