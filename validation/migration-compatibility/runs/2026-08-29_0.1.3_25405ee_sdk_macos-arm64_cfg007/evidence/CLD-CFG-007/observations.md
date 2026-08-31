# Observations

- Host process has no pre-existing value. Relay passes project-only then empty source lists exactly.
- Same subprocess command returns the full space/Unicode value with project source and `MISSING_7007`
  without sources. Encoding and bytes are intact in native/Relay results.
- Each branch has one accepted approval, one call, one result and no diagnostic or fallback.
