# CLD-IMG-004 Observations

- Four paste actions are accepted and DSH previews retain `.png`, `.jpeg`, `.gif`, and
  `.webp` labels in the supplied order.
- DSH persists four distinct refs with exact media types, 360×360 dimensions, byte
  counts, and content hashes; all four local object digests match the source fixtures.
- The linked native Claude user message is `[image,image,image,image,text]`; media types
  remain PNG/JPEG/GIF/WebP and each decoded Base64 payload is byte-identical to its source.
- The prompt contains no expected shape/color tokens. Claude's exact ordered answer
  correctly interprets every format; DSH/native tool counts are zero.
- No GIF/WebP-to-PNG conversion or MIME rewrite occurred anywhere in the observed path.
