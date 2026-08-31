# Observations

- Production `auto` constructs SDK as primary and starts CLI only after SDK startup throws.
- The real installed SDK starts and exposes only `text+image` model entries; CLI exposes only `text` entries.
- Image and DSH-tool messages each return the documented CLI error with zero spawned processes.
- The retained live business transcript has only native entrypoint `sdk-ts` and prompt source `sdk`.
- Focused production tests pass 46/46. CLI execution assertions use a deterministic fake process, so they prove
  argument and stream contracts rather than a fresh live Claude CLI model response.
