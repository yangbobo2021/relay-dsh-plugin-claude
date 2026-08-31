# Self-review

## Process validity

- Three branches progressively add one source while keeping cwd, client, model, command and approval
  response constant. Captured SDK options and native histories prove the intended inputs.
- Guarded user replacement is restored in the normal path and `finally`; SHA confirms completeness.

## Result reliability

- Exact subprocess stdout, not the terminal markers, establishes the winning source.
- All three levels are independently observed, so the verdict does not infer user/project behavior from
  the local-only comparison in CFG-003.
- Equal approval handling and zero fallback remove interaction bias.

## Verdict

Pass. Conflicting user, project and local settings resolve in the observed user < project < local order.
