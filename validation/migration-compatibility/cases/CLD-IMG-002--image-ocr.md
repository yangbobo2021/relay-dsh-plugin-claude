# CLD-IMG-002 — Image OCR

## Traceability

- Primary requirement: `CLD-IMG-002`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove that Claude can transcribe a fixed text marker from one DSH image attachment
without receiving that marker in prompt text or reading the Workspace file with tools.

## Preconditions

- `CLD-IMG-001` is closed; use a fresh DSH/Claude Session.
- Render `ocr-marker.png` deterministically from its SVG source and verify dimensions,
  format, digest, and expected source text before attachment.
- The exact third-line target is `CLD-OCR-7Q9M-2026`.

## Method

1. Attach exactly one `ocr-marker.png` through the DSH composer in the image fixture
   Workspace; do not put the target string or image filename in the user prompt.
2. Ask Claude to inspect only the attached image and return all visible text lines joined
   with `|`, without tools, fallback answer, or explanation.
3. Require exact line order, case, spaces, punctuation, digits, and character order in
   the terminal answer.
4. Correlate the DSH attachment ref/store, archive, Relay link/replay state, native Claude
   `[image,text]` content, UI, zero tool activity, and unchanged fixture bytes.
5. Retain sanitized evidence and self-review whether the marker could have reached Claude
   through prompt text, title generation, filename, Workspace tools, or prior context.

## Expected results

- Required observable: exact
  `RELAY MIGRATION|SAMPLE CARD|CLD-OCR-7Q9M-2026`.
- Forbidden observable: transcription error, target in user prompt, no native image,
  image count other than one, tool activity, attachment failure, or changed fixture.
- Presentation expectation: DSH shows one image and one exact OCR final.

## Evidence to retain

- Fixture/render metadata and digests.
- Sanitized DSH/native content summaries, attachment identity, UI screenshot, and hashes.
- No raw Base64 payload, credentials, unrelated Sessions, or unrelated native content.

## Result interpretation

- Pass only when exact OCR and exact image transport independently agree.
- Fail when the text cannot be read exactly or image transport is not proven.
- Blocked only for unavailable DSH attachment service/UI or authenticated backend outage.
