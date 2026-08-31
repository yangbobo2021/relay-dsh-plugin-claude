# CLD-TXT-002 Observations

- Input and terminal output visibly render Chinese `中文` and Emoji `🚀` without a
  replacement glyph or escaped literal.
- Independent oracle and persisted terminal text are byte-identical:
  `434c445f5458543030325fe4b8ade696875ff09f9a805f31303032` (`27` bytes).
- The archive contains exactly one assistant message, one terminal text block, completed
  turn end, and zero tool event lines.
- Link store grows from one to two records. The new DSH Session maps uniquely to Claude
  Session `cfec8c1d-5ff0-4548-bc76-7161671b2834`; no existing mapping changes.
- Workspace manifest stays
  `b68ece075dc2bdc11492d8a446a20d09dcb1ac3016b573fa28e8343a3322c953`.
  DSH Session path-set also stays fixed after the new empty Session was created, showing
  the turn appended to its expected archive rather than creating another Session.
- Screenshot SHA-256 is
  `490c5ce4d501bc50c3457ca65e0d27dc899978e7b98d08f6895fda8d82fafa23`.
