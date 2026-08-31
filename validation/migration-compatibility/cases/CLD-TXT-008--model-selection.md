# CLD-TXT-008 — Model selection

## Traceability

- Primary requirement: `CLD-TXT-008`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `L`, `W`
- Priority: `P0`

## Objective

Prove that selecting Claude Sonnet in DSH reaches the live Agent SDK/Claude Code Session,
not merely the UI label or Relay link metadata.

## Preconditions

- `CLD-TXT-007` is closed; use a fresh DSH/Claude Session.
- Prior live cases selected Haiku; this case visibly selects Sonnet/Medium.
- The exact new Claude Session JSONL can be located by its isolated link ID; only
  sanitized model/session fields may be retained.

## Method

1. Create a fresh DSH Session, select Claude Code and leave/select Claude Sonnet/Medium.
2. Send an exact no-tool marker prompt and complete the turn.
3. Require DSH selector, Relay link config, persisted DSH assistant source, and native
   Claude Code Session assistant `message.model` to agree on Sonnet.
4. Require one new Claude Session, exact final, zero tools, and unchanged Workspace.
5. Retain sanitized model evidence, screenshot, and self-review.

## Expected results

- Required observable: native Claude Session records a Sonnet model identifier.
- Forbidden observable: Haiku/Opus native model, UI-only selection, replacement binding,
  missing exact final, tool activity, or leaked unrelated Claude configuration.
- Presentation expectation: DSH displays Claude Sonnet and Medium for the owning Session.

## Evidence to retain

- Sanitized native Session model values and exact Claude Session ID only.
- Link/DSH archive source model and UI screenshot.
- No credentials, other Sessions, or user configuration contents.

## Result interpretation

- Pass when native model, link, archive, and UI all agree on Sonnet.
- Fail when SDK executes using a different model or native evidence is absent.
- Blocked only when account/network/Host or exact native Session evidence is unavailable.
