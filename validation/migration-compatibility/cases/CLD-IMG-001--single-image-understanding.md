# CLD-IMG-001 — Single-image understanding

## Traceability

- Primary requirement: `CLD-IMG-001`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove that one DSH image attachment reaches the Claude Agent SDK as image content and
Claude correctly identifies a deterministic non-text visual marker.

## Preconditions

- `CLD-TXT-010` is closed; use a fresh DSH/Claude Session.
- Render `single-visual-marker.png` deterministically from its SVG source and verify its
  dimensions, format, pixel samples, and digest before attachment.
- The image contains no text: one purple triangle above exactly two green circles.

## Method

1. Select the image-input fixture Workspace and create a fresh Claude Code Session.
2. Attach exactly one `single-visual-marker.png` through the DSH composer and ask for one
   rigid observation record without naming the expected shapes, colors, or counts. Give
   a closed basic-color vocabulary so shade naming cannot create a false mismatch.
3. Require the exact precommitted observation only when Claude sees the intended visual;
   reject guesses, fallback text, missing attachment, tool-based file reads, or duplicate
   images.
4. Correlate DSH persisted attachment metadata, Relay link/replay Session, native Claude
   user content, UI presentation, terminal answer, zero tool activity, and unchanged
   fixture bytes.
5. Retain sanitized evidence and self-review whether the prompt could pass without
   actually receiving the image.

## Expected results

- Required observable: exact
  `BACKGROUND=YELLOW;TOP=TRIANGLE,PURPLE,1;BOTTOM=CIRCLE,GREEN,2`.
- Forbidden observable: another answer, no native image content, image count other than
  one, tool activity, attachment error, failed turn, or changed fixture.
- Presentation expectation: DSH shows one attached image and one exact final answer.

## Evidence to retain

- Fixture/render metadata and digests.
- Sanitized DSH/native attachment and content-block summaries, identities, and screenshot.
- No raw Base64 payload, credentials, unrelated Sessions, or unrelated native content.

## Result interpretation

- Pass only when visual answer and transport evidence independently agree.
- Fail when Claude cannot receive or correctly interpret the image.
- Blocked only for unavailable DSH attachment UI/service or authenticated backend outage.
