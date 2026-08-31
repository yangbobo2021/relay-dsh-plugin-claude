# CLD-EXT-010 Observations

- Explicit branch: one exact `ToolSearch`, one `explicit_failure`, one allowed-once approval, native
  `is_error: true`, DSH `status: error`, exact error marker, and exact prescribed terminal response.
- The explicit branch's second turn uses the same Claude Session ID, invokes no tool, and completes
  exactly with `CLD_EXT010_EXPLICIT_RECOVERY_1010`.
- Timeout branch: one exact `ToolSearch`, one `slow_timeout`, one allowed-once approval, and one
  timeout error. No retry or fallback appears in native or DSH evidence.
- The independent server records its call at 1788001173118; DSH completes the error activity at
  1788001174634, a 1516ms interval matching the configured 1500ms wall-clock bound plus overhead.
- Claude's human-facing error rounds 1500ms down to `after 1s`; the measured boundary, not the
  rounded phrase, is used for validation.
- Timeout terminates the STDIO process before its eight-second callback. Waiting beyond that window
  yields zero late-finish events, zero fixture processes, and zero forbidden late-result markers in
  native transcript, DSH archive, or UI.
- The timeout branch's second turn stays on the same Claude binding, uses no tool, and completes
  exactly with `CLD_EXT010_TIMEOUT_RECOVERY_1010`.
- Eight process starts are initialization/auxiliary lifecycle noise across four turns. Business-call
  counts remain exactly one per branch, so they do not represent retries.
