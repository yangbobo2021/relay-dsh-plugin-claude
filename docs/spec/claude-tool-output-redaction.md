# Claude Tool-Output Redaction

## Status

This document defines the plugin-owned secret-redaction contract for the
default Claude Agent SDK backend. It is the tracked delivery specification for
`CLD-ENV-003` and GitHub Issue #29.

## Contract

The plugin must resolve the effective Claude settings before every new or
resumed turn, using the same workspace and `settingSources` passed to the SDK.
The effective environment is the SDK process environment overlaid with the
resolved settings environment.

An environment value is sensitive when its non-empty variable name contains a
credential-bearing segment such as `SECRET`, `TOKEN`, `PASSWORD`, `PASSWD`,
`API_KEY`, `ACCESS_KEY`, `PRIVATE_KEY`, or `CREDENTIALS`. A variable explicitly
listed under `sandbox.credentials.envVars` is also sensitive, regardless of its
name. If multiple sensitive names have the same value, the lexicographically
first name supplies the deterministic replacement marker.

Before a successful tool result is delivered to the model, SDK consumers, or
native Session persistence, the plugin must run a synchronous SDK `PostToolUse`
callback. Every exact occurrence of a sensitive value in a string anywhere in
the structured tool response is replaced with
`[REDACTED_ENV:<VARIABLE_NAME>]`. Longer values are processed first so an
overlapping shorter value cannot partially expose them.

The callback must not return `updatedToolOutput` when no configured value
occurs. This preserves the original object and avoids an identity rewrite that
could compete with another legitimate output-rewriting hook.

The redacted result, not the raw result, must be visible in both normalized SDK
activity and the native Claude JSONL transcript. Tool execution status and
non-sensitive output remain unchanged.

## Boundaries

This contract protects tool output containing values from the effective Claude
environment. It does not rewrite user prompts, tool inputs, arbitrary values
that cannot be classified from host configuration, files created by tools, or
errors for which the SDK emits `PostToolUseFailure` without a replaceable tool
output. It applies to the SDK backend; the explicit CLI fallback does not offer
the required pre-persistence hook contract.

The implementation must use the supported SDK result-replacement lifecycle.
Post-hoc edits to Claude JSONL files are forbidden because they are racy and can
damage Session continuation.

Claude treats output rewrites from multiple synchronous hooks as competing
replacements. A trusted administrator who installs another `PostToolUse` hook
that supersedes this plugin's redacted result must ensure that replacement does
not reintroduce a protected value; the plugin cannot sanitize output created
after its callback has returned.

## Delivery Acceptance

1. The historical `CLD-ENV-003` probe reproduces the pre-fix leak while the
   Bash tool completes successfully.
2. The same probe against the fixed plugin executes Bash exactly once, keeps
   the expected final marker, and finds zero raw-secret occurrences in SDK
   activity, the native transcript, diagnostics, and final text.
3. Focused tests cover sensitive-name detection, explicit credential names,
   nested structured output, ordinary values, no-op output, and both new and
   resumed turns.
4. Typecheck, the complete test suite, build, package dry-run, a real SDK probe,
   and an official DSH end-to-end run all pass.
