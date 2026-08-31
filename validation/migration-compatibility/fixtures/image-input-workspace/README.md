# Image-input fixture

`single-visual-marker.png` is deterministically rendered from
`single-visual-marker.source.svg`. The visual assertion is one purple triangle above
exactly two green circles on a pale yellow background; it intentionally contains no
text so `CLD-IMG-001` does not overlap the OCR case.

`ocr-marker.png` is deterministically rendered from `ocr-marker.source.svg`. Its third
line is the exact OCR target for `CLD-IMG-002`.

`ordered-first.png` and `ordered-second.png` are text-free ordered multi-image fixtures:
the first contains one red square and the second one blue circle.

`format-{png,jpeg,gif,webp}` are independently rendered, text-free fixtures for the four
Claude SDK image media types. Their objects are respectively red square, green triangle,
blue circle, and purple diamond.
