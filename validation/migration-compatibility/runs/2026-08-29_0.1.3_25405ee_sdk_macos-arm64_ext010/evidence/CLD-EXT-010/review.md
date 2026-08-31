# CLD-EXT-010 Self-review

## Process review

- The two failure modes ran in fresh DSH Sessions, preventing one branch's error or permissions from
  contaminating the other.
- Both prompts constrain discovery, business-call count, retry, fallback, and output. Native Claude,
  DSH activity, independent server log, and UI were compared rather than trusting the final text.
- Recovery was tested as a second turn on the original Claude binding in each branch. A new Session
  would not have proven continuity.
- Timeout timing uses the independent server's `tool-call-start` and DSH's error completion. This
  avoids counting human approval delay and independently validates the configured boundary.
- The eight-second safety wait was meaningful even though no late-finish log appears: process
  termination is proven, and native/DSH/UI were re-read after the callback deadline.

## Reliability review

- Exact call counts rule out hidden business retries; process-start count is kept separately and
  explicitly interpreted as runtime initialization.
- Exact Session IDs, completed-turn counts, and final-text arrays prove same-binding usability.
- The timeout wording rounds to one second, but 1516ms server-to-error measurement directly supports
  the 1500ms configuration. Treating the wording alone as exact would have been unreliable.
- Zero forbidden-marker occurrences plus zero surviving server processes is stronger evidence than
  checking only the immediate transcript.
- Config/source digests, object count, nested Git HEAD/status/index, and process checks exclude
  unrelated side effects and fixture leakage.

## Verdict

Pass. Explicit MCP failures and hard timeouts remain visible, single-call, bounded, non-late, and
recoverable on their owning Claude/DSH Session.
