# CLD-TOOL-011 Observations

- Independent execution and the live Claude Bash both return exit 1, two total tests, one pass,
  one fail, and the exact intentional failure `CLD_TOOL011_FAIL_1111`.
- Native Claude contains exactly one Bash, one error result with the complete TAP summary, and the
  required exact final. DSH mirrors one allowed approval, error activity output, and a completed
  owning turn.
- The non-zero command status is not confused with an unusable Session or with all tests failing.
- All ten Workspace files, including the fixture, remain byte-identical; no object appeared.
