# Self-review

## Process validity

- Same cwd/client/command and independent Sessions differ only by project setting source.
- Host absence check and no-source fallback exclude inherited environment as the cause.
- Approval preserves exact input; structured/native outputs are used instead of final markers.

## Result reliability

- Unicode and spaces make truncation/encoding errors observable, while the literal missing branch proves
  the command actually inspected its environment.
- Exact command is single-quoted around JavaScript and contains no shell substitution of the value.

## Verdict

Pass. Settings environment values reach real subprocesses intact through Relay's Claude SDK path.
