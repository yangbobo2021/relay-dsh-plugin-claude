# Observations

- Both absolute Reads used SDK `default` mode and emitted one approval with the explicit outside-path reason.
- Decline produced a failed Read containing only the deliberate denial; the fixture marker appears nowhere in
  its result or exact final. Accept produced one completed Read with exact fixture content.
- No fallback tool ran, the outside file digest was unchanged, and the temporary file is absent afterward.
