# CLD-EXT-009 — MCP text, JSON, and image results

## Traceability

- Primary requirement: `CLD-EXT-009`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P1`

## Objective

Prove that separate MCP text, structured JSON, and PNG result types reach Claude intact, remain
distinguishable, are projected through DSH, and support one grounded synthesis.

## Method

1. Record immutable server/image digests and attachment-object baseline. Install one temporary
   project STDIO MCP config with three result-type tools and an append-only call log.
2. In a fresh tool-workspace Claude Session, load schemas with exact ToolSearch selectors as needed,
   then call `result_text`, `result_json`, and `result_image` exactly once each in that order. Allow
   only those business calls. Do not put any server output marker or expected visual answer in the
   prompt.
3. Require native exact text; JSON text plus structured content
   `{kind:CLD_EXT009_JSON_0909,value:909,nested:{ok:true}}`; and one image block whose decoded PNG
   digest is `deeb5267...325e4`, dimensions are 400x400, and visual is a blue circle.
4. Require one-line synthesis `<text>|<kind>:<value>|<COLOR>_<SHAPE>`, exact server call order,
   DSH lifecycles/results, intentional image object projection if present, stable unrelated state,
   and self-review.
5. Archive evidence, remove temporary config, confirm fixture processes exit, source is unchanged,
   and no extra image/object remains beyond the one justified projection before advancing.

## Expected results

- Required observable: all three independent result types preserve exact values/bytes, each business
  tool runs once, and Claude returns `CLD_EXT009_TEXT_0909|CLD_EXT009_JSON_0909:909|BLUE_CIRCLE`.
- Forbidden observable: missing/coerced JSON, lost/corrupt image, duplicate/fallback tool, fabricated
  synthesis, more than one new durable image object, unrelated mutation, lingering config/process,
  or leak.

## Result interpretation

- Pass only when all three type paths, synthesis, lifecycle, state, and cleanup pass.
- Fail if any type is absent/corrupt/unusable even when the others work.
- Blocked only for backend infrastructure outage unrelated to MCP result handling.
