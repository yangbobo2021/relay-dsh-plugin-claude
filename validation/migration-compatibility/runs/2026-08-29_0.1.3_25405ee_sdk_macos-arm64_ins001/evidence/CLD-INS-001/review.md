# Self-review

## Process validity

- Expected answer is absent from the user prompt and appears only in the temporary instruction fixture.
- Independent Session, source-disabled query and physical deletion provide a strong negative control.
- File creation/removal is guarded and cleanup absence is checked after process exit.

## Result reliability

- Exact answer versus a long unrelated control makes random coincidence implausible; no tool or other
  source can supply the marker. Fixture and transcript hashes preserve evidence.
- Lack of serialized memory-path metadata is not hidden; the controlled behavioral differential is the proof.

## Verdict

Pass. User CLAUDE.md instructions affect fresh Relay Claude Sessions and do not leak when excluded.
