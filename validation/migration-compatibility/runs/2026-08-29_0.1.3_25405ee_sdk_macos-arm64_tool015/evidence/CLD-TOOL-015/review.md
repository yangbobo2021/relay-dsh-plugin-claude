# CLD-TOOL-015 Validation Review

## Reasonableness

- Separate fresh Sessions prevent an allow decision from contaminating the deny branch. Distinct
  files provide direct positive and negative side-effect oracles.
- Checking denial before decision and after terminal state plus a safety interval detects execution
  before approval as well as delayed execution.

## Reliability

- Two exact commands, two distinct bindings, native results, DSH decision/activity events, exact
  allow bytes/final, durable denied absence, explicit reject result/final, stable unrelated state,
  and zero object delta agree.

## Verdict

**Pass, high confidence.** Allow-once executes exactly once; reject prevents execution and is
correctly surfaced to the same owning turn.
