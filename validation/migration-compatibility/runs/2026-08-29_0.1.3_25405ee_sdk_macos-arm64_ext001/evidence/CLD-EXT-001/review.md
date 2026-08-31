# CLD-EXT-001 Validation Review

## Reasonableness

- A before/after initial-listing delta proves discovery at Session initialization. An unrelated
  no-tool probe prevents explicit Skill loading from contaminating the result.
- The unique name, exact description, absent project copy, and byte-equal user/canonical fixtures
  establish source identity without relying on final model text.

## Reliability

- Prior absence/count 12, fresh business and auxiliary presence/count 13, exact description, zero
  tools, exact probe final, stable cwd/link/Git/object state, and immutable fixture digests agree.

## Verdict

**Pass, high confidence.** The SDK Session automatically discovers the user-scoped Claude Skill.
