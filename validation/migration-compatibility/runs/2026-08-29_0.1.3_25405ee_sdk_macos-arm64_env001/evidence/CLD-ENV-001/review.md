# Self-review

## Process validity

- A unique bare command and verified host-PATH absence make absolute-path/default discovery impossible.
- Fresh Sessions differ only in setting sources; command, cwd, model, approval and prompt constraints match.
- Exact executable content/hash supplies a stable stdout oracle.

## Result reliability

- Configured completion and unconfigured exit 127 are decisive and independently preserved in transcripts.
- One call/request per branch rejects retries or alternate resolution.
- Project settings cleanup prevents the validation from changing subsequent environment tests.

## Verdict

Pass. Relay's Claude SDK path propagates project PATH values to real executable discovery.
