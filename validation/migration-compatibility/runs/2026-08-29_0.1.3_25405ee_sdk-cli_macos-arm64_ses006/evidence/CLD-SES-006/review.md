# Self-review

## Process validity

- Backend identity is not inferred from configuration alone: production selection code, instantiated clients and
  a real live native transcript agree.
- Unsupported CLI inputs use an impossible executable and still fail with zero processes, proving pre-spawn
  rejection rather than incidental command failure.
- Focused tests exercise both client classes and the production DSH adapter boundary.

## Result reliability

- Exact source/transcript hashes and fixed Session IDs make the source/live assertions traceable.
- SDK startup is real but no paid model call is needed for model metadata; CLI argument tests are deterministic.
- The applicability report explicitly leaves untested CLI behaviors unverified and does not inherit 85 SDK runs.

## Verdict

Pass. SDK is the active migration baseline. CLI is a text-only fallback with a narrower directly tested contract,
not an equivalent recipient of the SDK validation matrix.
