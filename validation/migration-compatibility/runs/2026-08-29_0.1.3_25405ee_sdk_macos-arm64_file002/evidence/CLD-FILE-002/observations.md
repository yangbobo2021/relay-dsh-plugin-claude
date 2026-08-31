# CLD-FILE-002 Observations

- The PDF fixture is one valid US-letter page. Text extraction finds its exact marker once,
  and visual inspection of the Poppler render found no clipping, overlap, or illegibility.
- The composer has zero file inputs. Pasting `application/pdf` produced an alert within
  95ms: `仅支持 PNG、JPG、WebP、GIF 格式的图片`; it remained observable for roughly four
  seconds and then disappeared.
- No attachment chip or draft file appeared, and send stayed disabled while text was empty.
- A recovery draft could be entered and enabled Send immediately after rejection. It was
  then cleared by Select All/Backspace and never sent.
- Claude native records, DSH Sessions, link store, and attachment objects were unchanged;
  neither the PDF marker nor recovery marker appears in persisted DSH/native state.
- This meets the requirement's explicit-rejection branch but proves PDF is unsupported.
