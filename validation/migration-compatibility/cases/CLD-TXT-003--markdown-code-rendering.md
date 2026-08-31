# CLD-TXT-003 — Markdown and code rendering

## Traceability

- Primary requirement: `CLD-TXT-003`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `L`, `W`
- Priority: `P0`

## Objective

Prove that a live Claude response preserves a fixed Markdown heading, ordered content,
blank line, fenced JavaScript code block, indentation, quotes, and line breaks through
the DSH archive and semantic Web rendering.

## Preconditions

- `CLD-TXT-002` is closed; use a new DSH/Claude Session.
- Live SDK and the plain-text Workspace are available.
- Expected Markdown contains heading `# Relay Markdown 1003`, list items `alpha`/`beta`,
  and JavaScript marker `CLD_MD_CODE_1003`.

## Method

1. Create a fresh DSH Claude Code Session at Haiku/Low.
2. Ask for the exact fixed Markdown payload with no tools or extra prose.
3. Require one persisted terminal text block byte-identical to the expected payload.
4. Inspect browser semantics for one level-one heading, two ordered list items, and one
   JavaScript code region preserving its two exact source lines.
5. Retain archive/UI evidence and self-review before the next requirement.

## Expected results

- Required observable: readable heading, list, and exact code structure.
- Forbidden observable: lost fence semantics, collapsed lines, escaped Markdown,
  extra prose, duplicate terminal block, or tool call.
- Persistence expectation: raw terminal Markdown is byte-identical to the oracle while
  DSH renders it semantically rather than as one unformatted paragraph.

## Evidence to retain

- Exact expected/actual payload digests and structural archive summary.
- Browser DOM semantic snapshot and visible screenshot.
- Link/session identity and zero-tool evidence.

## Result interpretation

- Pass when raw bytes and rendered semantics both satisfy all fixed assertions.
- Fail when Claude executes but persistence or rendering loses required structure.
- Blocked only for account/network/Host infrastructure failure.
