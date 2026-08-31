# CLD-TXT-008 Observations

- The model selector was explicitly changed Haiku→Sonnet before send and displayed
  `Claude Sonnet Medium` throughout completion.
- Link config persists `model: sonnet`, `effort: medium`; DSH assistant source records
  `provider: relay-claude`, `model: sonnet`, and the same Claude Session ID.
- Exact native Claude Session JSONL contains one assistant message whose actual model is
  `claude-sonnet-5` and stop reason `end_turn`. This is direct backend evidence rather
  than inference from the Relay selector.
- One final `CLD_TXT008_SONNET_OK_1008`, zero tools, one new binding, and unchanged
  Workspace manifest complete the path.
- Screenshot SHA-256 is
  `9258e0160c5742cdcf7b6d793066b5a89a9b21365133e04bb44315bfa07eab3d`.
