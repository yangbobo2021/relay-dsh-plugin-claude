# CLD-CFG-007 — Settings environment values

## Traceability

- Primary requirement: `CLD-CFG-007`
- Backend applicability: `sdk`
- Verification levels: `P`, `L`
- Priority: `P1`

## Objective

Prove a project settings environment value, including spaces and Unicode, reaches a real subprocess intact.

## Method

1. Set `CLD_CFG007_VALUE` to fixed `CFG007 value 中文 7007` in a dedicated project setting.
2. Project-source Session runs one exact Node command that writes the value without a newline.
3. Source-disabled control runs the identical command and writes `MISSING_7007` when absent.
4. Compare exact stdout, query sources, native histories and state; self-review shell quoting.

## Expected results

- Required observable: exact Unicode value versus exact missing control.
- Forbidden observable: prompt echo, host pre-existing env, altered encoding, fallback or mutation.

## Result interpretation

- Pass only when the controlled subprocess outputs establish propagation.
- Fail if absent, corrupted or present in the source-disabled control.
