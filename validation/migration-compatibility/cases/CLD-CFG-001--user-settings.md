# CLD-CFG-001 — User settings.json

## Traceability

- Primary requirement: `CLD-CFG-001`
- Backend applicability: `sdk`
- Verification levels: `P`, `L`
- Priority: `P0`

## Objective

Prove that Relay's SDK path loads an isolated user `settings.json` and that a non-UI permission setting
has an observable effect, while the same command is executable when the user setting source is disabled.

## Method

1. Point `CLAUDE_CONFIG_DIR` to a sanitized validation directory whose `settings.json` denies one exact
   read-only Bash `printf` command; hash the real user configuration before the run.
2. Fresh Session with `settingSources: ["user"]`: require the exact command once and record structured
   denial, handler/output absence, completion and terminal classification.
3. Independent control Session with `settingSources: []`: run the same exact command, allow the normal
   Relay approval once if requested, and require its exact stdout.
4. Compare query options, native transcripts, requests and all state/config/source baselines; self-review
   prompt compliance separately from the permission engine outcome.

## Expected results

- Required observable: the user-source branch denies the exact command before stdout; the source-disabled
  control executes it and returns `CFG001_USER_SETTING_ACTIVE_1001`.
- Forbidden observable: mutation, real-user config change, broad command, fallback, result ambiguity, or
  passing solely from a prompt-supplied marker.

## Result interpretation

- Pass only when the controlled differential proves the user source causes the denial.
- Fail if the setting is ignored, leaks into the disabled-source control, or Relay drops setting sources.
- Blocked only if isolated configuration prevents authenticated SDK startup after safe checks.
