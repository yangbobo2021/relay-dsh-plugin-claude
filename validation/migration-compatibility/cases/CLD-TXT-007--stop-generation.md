# CLD-TXT-007 — Stop generation

## Traceability

- Primary requirement: `CLD-TXT-007`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `L`, `W`
- Priority: `P0`

## Objective

Prove that DSH Stop interrupts an active live Claude SDK answer, reaches a terminal
interrupted state, emits no requested end marker afterward, and leaves the Session usable.

## Preconditions

- `CLD-TXT-006` is closed; use a fresh DSH/Claude Session.
- Prompt describes but does not contain full markers `CLD_STOP_BEGIN_1007` and
  `CLD_STOP_END_1007` and requests a 1,000-line response.
- Browser sampler can click Stop as soon as assistant begin text is visible.

## Method

1. Send the derived-marker long-response prompt with no tools.
2. Poll assistant paragraph text and Stop control. At the first active sample containing
   the begin marker and no end marker, click Stop and record elapsed time/text length.
3. Recheck after immediate, 3-second, and 12-second windows. Require Stop gone and end
   marker absent at every point with no growing late output.
4. Inspect archive terminal reason, partial assistant text, and zero tools. Send a short
   marker-free recovery turn in the same Session and require exact recovery output.
5. Retain timing trace/screenshots and self-review.

## Expected results

- Required observable: active output becomes interrupted and no end marker is emitted.
- Forbidden observable: requested end marker, continued late growth, still-running turn,
  replacement Session, failed recovery, or tool activity.
- Persistence expectation: interruption and recovery are ordered in one Session archive.

## Evidence to retain

- Stop timing and delayed samples, interrupted/completed archive reasons, text lengths.
- Stopped and recovery screenshots.
- Immutable link identity and zero-tool evidence.

## Result interpretation

- Pass when interruption stops output before the end marker, remains stable through the
  delay window, and the same Session completes a recovery turn.
- Fail when SDK accepts Stop but continues to the end or leaves the Session unusable.
- Blocked only for account/network/Host or browser control infrastructure failure.
