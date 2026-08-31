# CLD-IMG-009 — SVG output conversion

## Traceability

- Primary requirement: `CLD-IMG-009`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P1`

## Objective

Prove that a safe local SVG referenced by Claude's final answer is rasterized to a valid,
immutable, deterministic PNG attachment and never persisted as active SVG.

## Preconditions

- `CLD-IMG-008` is closed; use `safe-img009.svg` in image-output Workspace.
- The 240×160 SVG contains only inline geometry/colors and no script, entity, local file,
  remote URL, or embedded external resource. Record source/path/object/native state.
- No Claude tool is needed; two fresh Sessions will independently return the same path.

## Method

1. Run focused SVG rasterization and external-resource blocking tests.
2. In fresh Session A, ask Claude for exact `SVG_RESULT=./safe-img009.svg`; require DSH
   text plus one image attachment named `safe-img009.png` with `image/png`.
3. Independently decode the stored object and assert PNG, 240×160, white/red/blue interior
   pixel samples; record attachment ID/digest and unchanged source digest.
4. In fresh Session B, repeat the identical zero-tool final. Require the exact same
   attachment ID/digest and no second durable object for the conversion.
5. Correlate both link/replay/native/DSH Sessions, zero tools, completed turns, UI images,
   object-set deltas, and Workspace digests; then self-review safety and determinism.

## Expected results

- Required observable: both Sessions persist the same valid PNG attachment derived from
  the SVG; no SVG attachment is emitted.
- Forbidden observable: active SVG persistence, non-PNG media, external-resource access,
  differing conversion bytes, wrong pixels/dimensions, tool activity, or source mutation.
- Presentation expectation: DSH visibly renders one PNG image per Session.

## Evidence to retain

- SVG source digest/safety scan, focused tests, PNG metadata/pixels/digest.
- Sanitized dual-run DSH/native identities, object-set comparison, and screenshots.
- No credentials, unrelated Sessions, or unnecessary raw image data.

## Result interpretation

- Pass only when safety tests, live PNG conversion, and repeat determinism all succeed.
- Fail when SVG is exposed directly, conversion differs, or unsafe resources are loaded.
- Blocked only for unavailable rasterizer/attachment storage or backend outage.
