# CLD-FILE-002 Validation Review

## Reasonableness

- Generating, extracting, rendering, and visually inspecting the PDF prevents a malformed
  fixture from causing a false unsupported result. Keeping it outside the Workspace and
  withholding its marker ensures any read pass would require actual transport.
- High-frequency UI sampling captures a transient rejection that a single delayed
  screenshot would miss. Recovery drafting tests that rejection does not wedge composer.

## Reliability

- The clean alert screenshot, sampled DOM timeline, disabled empty send, recovery input,
  installed MIME contract, zero DSH/native/link/object deltas, zero marker hits, and empty
  Host output agree on a pre-SDK, recoverable format rejection.
- The alert is image-centric but explicit: it enumerates the only accepted formats, so a
  user can unambiguously infer that PDF is unsupported. That satisfies the written minimum
  observable; classifying it as PDF-reading support would not.

## Verdict

**Pass, high confidence, gracefully unsupported.** The product cannot read PDF documents,
but it rejects a valid PDF explicitly and remains usable, satisfying this atomic criterion.
