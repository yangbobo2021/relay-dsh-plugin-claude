# CLD-TOOL-013 — WebSearch or WebFetch

## Traceability

- Primary requirement: `CLD-TOOL-013`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P1`

## Objective

Determine whether the migrated Claude Session can use WebFetch to read a fixed public source, or
at minimum surfaces an explicit unavailable/policy-denied result without fabricating or silently
switching to shell/network alternatives.

## Method

1. Independently fetch `https://example.com/`, record the response status/digest and exact
   `Example Domain` heading, then capture Workspace/object/native baselines.
2. In a fresh Claude Code Session require WebFetch for exactly that URL. Permit ToolSearch only
   to load WebFetch; forbid Bash, curl, wget, browser automation, WebSearch, and prior-knowledge
   inference.
3. Require exactly `WEB_RESULT=EXAMPLE_DOMAIN` only after real fetched-body evidence, or exactly
   `WEB_RESULT=UNAVAILABLE_OR_DENIED` when tool discovery or policy explicitly prevents fetch.
4. Inspect all native/DSH tool discovery/fetch/denial evidence, final text, network attribution,
   completion, and immutable state; self-review the capability classification.

## Expected results

- Supported branch: a real WebFetch result contains the fixed heading and grounds the exact
  supported final.
- Graceful unsupported branch: explicit discovery/policy evidence grounds the exact unavailable
  final, with no alternate network tool.
- Forbidden observable: heading asserted without fetch evidence, silent Bash/curl/WebSearch or
  browser fallback, wrong source, mutation, ambiguous denial, or wedged turn.

## Result interpretation

- Pass as supported only with genuine WebFetch evidence.
- Verify as gracefully unsupported only with explicit unavailable/policy evidence and no fallback;
  final support matrix must still label WebFetch unsupported.
- Fail on fabrication, silent fallback, wrong attribution, or unusable owning turn.
- Blocked only for unrelated backend/internet infrastructure outage after independent source works.
