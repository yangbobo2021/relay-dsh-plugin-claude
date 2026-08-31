# CLD-SES-006 — SDK versus CLI applicability

## Traceability

- Primary requirement: `CLD-SES-006`
- Backend applicability: separate `sdk` and `cli` contract subcases
- Verification levels: `S`, `P`, `L`
- Priority: `P1`

## Objective

Prove which Claude backend the validated product actually uses and publish a conservative SDK/CLI capability
boundary that does not transfer SDK-only results to the CLI fallback.

## Method

1. Inspect production backend construction and require `auto` to try SDK first, explicit `sdk` to select SDK,
   explicit `cli` to select CLI, and fallback to occur only after SDK startup fails.
2. Start the real production SDK and CLI client classes without sending a model query; require SDK model metadata
   to advertise text+image and CLI metadata to advertise text only.
3. Give the CLI client an impossible executable, then submit image and DSH-tool messages; require explicit errors
   before any child process is created.
4. Run focused production-client tests for CLI session/configuration argument mapping and SDK query-option/bridge
   behavior. Inspect a previously validated live DSH business transcript for the native `sdk-ts` entrypoint.
5. Publish an applicability report that treats the 85 earlier run verdicts as SDK/product-surface evidence only,
   except where a case explicitly says otherwise; self-review every claim against retained evidence.

## Expected results

- Required observable: active live backend is SDK; backend selection, modalities and fail-closed boundaries agree
  across source, runtime probe, tests and native transcript.
- Forbidden observable: CLI process spawn for unsupported input, or claiming that SDK image/DSH bridge/live case
  results have been validated on CLI.

## Result interpretation

- Pass when the report names SDK as the active tested baseline and limits CLI claims to directly tested contracts.
- Fail if backend identity is ambiguous, unsupported data is silently dropped, or the report overclaims CLI parity.
