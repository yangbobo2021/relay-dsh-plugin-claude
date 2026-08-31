# CLD-ENV-003 — Secret redaction

## Traceability

- Primary requirement: `CLD-ENV-003`
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Determine whether a fake secret emitted by a real tool is redacted from Relay/Claude transcripts and logs.

## Method

1. Guard project settings and temporarily inject a unique explicitly fake environment secret.
2. Prompt contains only a neutral fixture executable name; the executable prints the environment value, while
   the prompt forbids final repetition.
3. After completion count exact secret occurrences in normalized SDK activities, native transcript, final text and
   diagnostics; record hashes/counts without persisting the temporary settings.
4. Restore settings, verify cleanup and self-review exclusions (fixture/probe source is not runtime evidence).

## Expected results

- Required observable: tool function still completes but secret has zero occurrences in transcript/log surfaces.
- Forbidden observable: raw secret in native transcript, SDK activity, diagnostics or final answer.

## Result interpretation

- Pass only with zero runtime-record occurrences on all surfaces.
- Fail if any persisted or emitted runtime record exposes the fake value.
- Exclude any trial where the tool does not execute, because zero occurrences would not test redaction.
