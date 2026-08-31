# CLD-IMG-007 Observations

- The source attachment object was absent before the turn. After the exact text final,
  one new content-addressed object exists and matches the source PNG byte-for-byte.
- DSH persists text block 0, image block 1, then finish; `assistant/message` repeats the
  same `[text,image]` structure with full attachment metadata.
- UI shows a separate `generated-img006.png` image control beneath the plain text path.
  This is not Markdown: native Claude final is only plain text and uses zero tools.
- Relay link and DSH replay state select the exact native business Session. Workspace
  paths and both file digests remain unchanged, proving promotion snapshots rather than
  mutates the source.
