# CLD-TOOL-008 Validation Review

## Reasonableness

- A fixed stderr marker and explicit non-zero exit isolate the Bash failure path. Requiring
  native and DSH tool-result evidence prevents the final answer from passing by prompt echo.
- Requiring exactly one tool call, one approval decision, a completed owning turn, and stable
  state tests failure presentation, no retry, continued usability, and absence of side effects.

## Reliability

- Exact command, native error content, exit code, stderr marker, DSH error activity, single
  approval pair, exact final, normal turn completion, stable Workspace, and zero object delta
  all agree. The business Session is independently mapped by the Relay link store.

## Verdict

**Pass, high confidence.** Bash failure semantics are explicit and durable while the owning
Claude turn remains usable and completes normally.
