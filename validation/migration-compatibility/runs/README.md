# Claude Runs

Each child directory is an immutable execution record containing at least:

```text
run.md
results.md
evidence/
```

Optional `logs/`, `screenshots/`, `sdk/`, `cli/`, and `artifacts/` directories may be
added inside a run. Never overwrite a completed run to make a later result appear
green; create a new run and link both from the report.

