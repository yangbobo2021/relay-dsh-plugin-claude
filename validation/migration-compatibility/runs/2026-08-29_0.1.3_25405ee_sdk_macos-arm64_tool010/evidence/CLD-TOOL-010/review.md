# CLD-TOOL-010 Validation Review

## Reasonableness

- The initial attempt only proved cancellation before a late side effect; it could not prove the
  process had launched. Adding an immediate, exact started-file oracle closes that gap.
- Stopping after that oracle but before a 15-second delayed output/file branch, then waiting past
  the deadline, directly tests child-process termination and late-side-effect suppression.

## Reliability

- Immediate file bytes, one allow decision, one Stop, durable DSH user abort, zero completed tool
  activity, no final, no late output/file, no residual process, stable unrelated digests, and zero
  object delta agree. The excluded approval-pending attempt cannot influence the verdict.
- Native wording conflates post-approval interruption with rejection. Because it is still an error,
  DSH preserves the actual user-abort reason, and the filesystem oracle proves termination, this is
  recorded as a representation gap rather than failure of the atomic minimum.

## Verdict

**Pass, high confidence, with a cancellation-label gap.** An already-started Bash process stops
and cannot produce its delayed marker or file.
