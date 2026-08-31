# CLD-EXT-009 Observations

- One combined ToolSearch returns exactly the three deferred schemas. Server and native histories
  then preserve one text, one JSON, and one image call in the requested order.
- Text is exact. JSON is retained structurally in native `mcpMeta.structuredContent` and projected
  to the model/DSH as its exact canonical JSON string, with no key/value loss.
- Native image is one base64 `image/png` block; decoded bytes equal the 400x400 source digest. Claude
  correctly identifies `BLUE_CIRCLE`, and DSH emits a visible attachment with the same digest/size.
- The content-addressed image object already existed from a prior image case, so DSH reuses it with
  zero object delta. All three approvals and tool lifecycles complete; the turn remains usable.
- Claude adds one progress sentence before the calls despite the concise-output request. The final
  synthesis block is exact. Config/process/source/Git cleanup and stability checks pass.
