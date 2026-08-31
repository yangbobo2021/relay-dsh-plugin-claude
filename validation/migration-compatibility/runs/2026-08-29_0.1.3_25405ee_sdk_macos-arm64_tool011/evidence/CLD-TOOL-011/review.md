# CLD-TOOL-011 Validation Review

## Reasonableness

- A mixed suite forces the interpreter to distinguish command exit, test totals, passed tests,
  failed tests, and failure identity. Independent calibration prevents prompt-derived assumptions.
- Exact one-tool execution and immutable state isolate test-running behavior from fallback tools or
  fixture rewriting.

## Reliability

- Independent TAP output, fixture digest, native error result, DSH error activity, one approval,
  exact final, normal turn completion, stable Workspace, and zero object delta all agree.
- Calibration wrapper issues were corrected before the live Session and are disclosed; they did
  not affect fixture bytes or the deciding execution.

## Verdict

**Pass, high confidence.** Claude runs the project test and correctly interprets a mixed result
including its non-zero exit and named failure.
