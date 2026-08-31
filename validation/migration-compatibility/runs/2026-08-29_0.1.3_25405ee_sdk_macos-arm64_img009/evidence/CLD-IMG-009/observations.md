# CLD-IMG-009 Observations

- The safe fixture scan found no script, entity, file, remote URL, or external resource.
- All three focused conversion/safety tests passed, including external-resource and entity
  rejection coverage.
- Each fresh business Session returned only `SVG_RESULT=./safe-img009.svg`; its native
  transcript contains one text assistant block and zero tool uses.
- DSH appended one PNG image after the text in each Session. Both messages contain the
  exact same attachment ID, name, media type, dimensions, and byte count.
- Trial A created one content-addressed object. Trial B created none and reused that
  object, proving repeat conversion bytes were identical under this environment.
- Independent decoding identifies a 240x160 RGBA PNG. Four interior/background samples
  match the SVG's white, red, and blue geometry.
- No SVG attachment was persisted, and the source SVG digest remained unchanged.
