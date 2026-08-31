# CLD-IMG-004 — PNG, JPEG, GIF, and WebP input

## Traceability

- Primary requirement: `CLD-IMG-004`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P1`

## Objective

Prove that DSH and Relay admit PNG, JPEG, GIF, and WebP images and deliver each format's
exact bytes and media type to one native Claude turn.

## Preconditions

- `CLD-IMG-003` is closed; use a fresh DSH/Claude Session.
- Render/fingerprint four text-free 360×360 fixtures independently.
- Ordered semantics: PNG red square; JPEG green triangle; GIF blue circle; WebP purple
  diamond. Clipboard labels must not disclose semantic content.

## Method

1. Paste one PNG, JPEG, GIF, and WebP fixture in that order into one DSH composer; require
   exactly four visible previews before send.
2. Without naming the expected shapes/colors, ask Claude for a rigid ONE–FOUR ordered
   visual record; prohibit tools and explanation.
3. Require DSH refs and native user blocks in exact media-type order
   `[image/png,image/jpeg,image/gif,image/webp]`, with four distinct IDs and exact decoded
   hashes/byte counts matching the fixtures.
4. Require the exact semantic final, completed turn, Relay replay identity, zero tools,
   and unchanged fixture bytes.
5. Retain sanitized evidence and self-review acceptance at UI, attachment store, adapter,
   Agent SDK/native Session, and model-understanding layers separately.

## Expected results

- Required observable: exact
  `ONE=SQUARE,RED;TWO=TRIANGLE,GREEN;THREE=CIRCLE,BLUE;FOUR=DIAMOND,PURPLE`.
- Forbidden observable: rejected or missing format, MIME rewrite, byte mismatch, swapped
  order, duplicate ID, wrong semantic, tool activity, or changed fixture.
- Presentation expectation: DSH shows four previews and one exact final.

## Evidence to retain

- Per-format render metadata, signatures, bytes, and digests.
- Ordered DSH/native media summaries, decoded hashes, identities, and UI screenshots.
- No raw Base64 payload, credentials, unrelated Sessions, or unrelated native content.

## Result interpretation

- Pass only when all four formats independently satisfy transport and visual assertions.
- Fail the atomic requirement when any one format is rejected, changed, lost, or unread.
- Blocked only for unavailable DSH attachment service/UI or backend outage.
