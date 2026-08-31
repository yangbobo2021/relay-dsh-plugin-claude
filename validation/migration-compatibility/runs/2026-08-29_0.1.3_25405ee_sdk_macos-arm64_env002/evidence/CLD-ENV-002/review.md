# Self-review

## Process validity

- `fileURLToPath` ensures the harness passes decoded filesystem paths rather than testing percent encoding.
- Four independent path surfaces—Runtime, SDK query, Bash and structured file tools—must agree.
- Unique Chinese source/output markers and external digests detect wrong-directory or wrong-encoding behavior.

## Result reliability

- Exactly three requested tools run in order with one approval and exact terminal marker.
- Source stability and target exact bytes prove normal read/write semantics in the selected cwd.
- Hashed native transcript and post-run target absence preserve traceability and fixture cleanliness.

## Verdict

Pass. Relay's real Claude path handles non-ASCII and spaced working directories across tools and persistence.
