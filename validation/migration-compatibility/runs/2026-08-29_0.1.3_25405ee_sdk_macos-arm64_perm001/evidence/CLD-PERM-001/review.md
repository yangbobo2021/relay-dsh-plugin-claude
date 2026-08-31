# Self-review

## Process validity

- Production Runtime state, production SDK option mapping and real native tool calls are all exercised.
- The same Workspace/policy/model/source setup uses opposite explicit decisions on unique absent targets.
- Exact Read digest proves non-mutating access while exact file existence/bytes are external mutation oracles.

## Result reliability

- Each Write request has the same tool ID/path/content as its activity; one completes and one fails.
- Denied target absence after terminal completion and allowed target exact digest decisively show enforcement.
- Native transcript hashes and post-run target absence preserve reproducibility without fixture contamination.

## Verdict

Pass. Relay propagates and enforces Workspace read/write approval policy on the real Claude SDK path.
