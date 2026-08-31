# CLD-CFG-008 — Supported settings hot reload

## Traceability

- Primary requirement: `CLD-CFG-008`
- Backend applicability: `sdk`
- Verification levels: `P`, `L`
- Priority: `P1`

## Objective

Determine whether a changed project environment setting is reloaded on a later turn of the same active
Claude Session, without Session rebinding.

## Method

1. Start with project value `HOT_A_8008`; same-Session turn 1 prints it through one exact subprocess.
2. Replace only the project settings bytes with value `HOT_B_8008` after turn 1 completes.
3. Resume the same Session for turn 2 with the identical command and require the new value.
4. Capture query session/resume metadata, outputs/native history and restore fixture bytes in `finally`;
   self-review process-environment caching versus settings reload.

## Expected results

- Required observable: A then B on one Session, query 2 using resume, with no other semantic change.
- Forbidden observable: fresh Session, stale A, host env mutation, retry/fallback or unrecovered fixture.

## Result interpretation

- Pass if later turn receives B on the same Session.
- Fail if active Session retains A or setting change is ignored.
