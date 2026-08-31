# CLD-IMG-005 Observations

- The corrupt payload can appear as a draft preview because DSH validates image bytes at
  submit, not paste. Submit returns an explicit alert and keeps the draft for correction.
- The alert is generic/misleading for a PNG-labeled corrupt file: it says only PNG/JPG/
  WebP/GIF are supported rather than identifying invalid content.
- Relay link-store bytes are unchanged, no native Claude JSONL appears, and no durable
  attachment object is created.
- One DSH Session shell is created. Its exact archive has only the Session header and four
  preset/policy selections—no user, request, turn, assistant, or tool event.
- Focused SDK/adapter tests independently prove invalid input cannot call `query()`, create
  a runtime Claude Session, or send a turn across five attachment failure modes.

## Product gaps

Improve the rejection copy, remove or visibly mark the invalid preview, and clean up the
empty DSH Session shell. These do not weaken the observed pre-SDK rejection boundary.
