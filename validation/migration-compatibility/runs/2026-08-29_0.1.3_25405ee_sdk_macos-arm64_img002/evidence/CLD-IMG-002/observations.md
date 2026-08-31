# CLD-IMG-002 Observations

- Two identical initial trials returned `NO_IMAGE` even though their linked native Claude
  records contained an exact inline PNG. A third all-lines prompt transcribed the image
  exactly and its thinking identified the instruction-like `READ THIRD LINE` text as a
  possible prompt injection.
- Self-review therefore replaced instruction text with neutral labels before the formal
  trial. The unique third-line marker was unchanged.
- The formal DSH composer/chat shows exactly one image. DSH attachment ref, local object,
  native decoded Base64, and fixture are the same 25,069 bytes and SHA-256.
- The target never appears in the formal user prompt, filename, or title prompt. Native
  user content is `[image,text]`; output contains all three neutral lines exactly.
- DSH replay state selects the image-bearing business Session, with one assistant,
  completed turn, zero DSH tools, and zero native tool blocks.

## Migration boundary

Neutral OCR is supported. Images containing imperative or instruction-like text may
activate Claude's prompt-injection defenses and can yield a misleading `NO_IMAGE` answer;
applications that OCR untrusted screenshots or documents must expect that safety behavior.
