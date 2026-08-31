# CLD-TXT-001 Observations

- The visible Session header is `Claude Code`; the composer records `Claude Haiku` and
  `Low` before and after the turn.
- Live completion finishes in `8.7s` with first token at `7.7s`. The one terminal text
  block is exactly `CLD_TXT001_PLAIN_OK_1001`.
- Persisted archive contains one `turn/start`, one `assistant/message`, one completed
  `turn/end`, and zero tool event lines. The assistant message source is
  `provider: relay-claude`, `model: haiku`, with the exact bound Claude Session ID.
- The isolated link store changes from absent to exactly one DSH→Claude mapping. Its
  SHA-256 is `a351e5f2b0ac2a6750888ca7a2276168d2d81c758ddf9ae5323da40e6279e0b5`.
- Workspace file set stays exactly `workspace.txt`; file SHA-256 remains
  `5128c2e7d026a428d190b7341a15ebbb1ffc2bdd5f540f115731768216fd3a55` and manifest
  SHA-256 remains `b68ece075dc2bdc11492d8a446a20d09dcb1ac3016b573fa28e8343a3322c953`.
- DSH archive SHA-256 is
  `3a28e4959901f30049b260a2e67ad55281ee3137852d28bd181ab886ea8762bf`.
  Screenshot SHA-256 is
  `1ff110dd0debf9f378ed9b83f23b4e6fd7a0cc54e0238d19f42bc416173ac77d`.
