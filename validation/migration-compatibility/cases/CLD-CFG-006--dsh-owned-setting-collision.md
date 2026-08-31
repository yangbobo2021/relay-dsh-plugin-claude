# CLD-CFG-006 — DSH-owned setting collision

## Traceability

- Primary requirement: `CLD-CFG-006`
- Backend applicability: `sdk`
- Verification levels: `P`, `L`
- Priority: `P0`

## Objective

Document and prove that DSH/Relay owns model, effort, effective permission mode and cwd when Claude
settings conflict, while settings sources remain enabled for non-owned configuration.

## Method

1. Fixture project settings request Haiku, Low and Plan. Run the production SDK client with explicit
   Sonnet, Medium, workspace-write/on-request and the exact fixture cwd; capture query options and native
   transcript actuals under `settingSources: ["project"]`.
2. Independently exercise the production DSH adapter with explicit DSH model/effort, agent-header cwd,
   and native permission events; capture the exact Runtime message/config it produces.
3. Require SDK/native agreement on Sonnet/Medium/default permission/cwd and adapter agreement on DSH
   overrides, with project source still present.
4. Hash source/fixtures/transcript and state; self-review component versus live evidence boundaries.

## Expected results

- Required observable: explicit DSH/Relay values reach query/native records despite conflicting settings.
- Forbidden observable: Haiku/Low/Plan winning, wrong cwd, disabled setting sources, mutation or claim-only pass.

## Result interpretation

- Pass only when adapter mapping and real SDK/native outcomes agree for all four owned fields.
- Fail if any setting overrides the DSH-owned value.
