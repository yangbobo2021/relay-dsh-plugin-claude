# CLD-TXT-006 Observations

- First turn stores private marker and returns exact `ACK_CTX_1006`.
- Second prompt is independently checked marker-free; second final is exact
  `CLD_CTX_PRIVATE_1006_Q7NX`.
- One archive grows from `4,061` to `6,161` bytes and contains two ordered starts, two
  completed ends, and assistant finals in order: ACK then private marker.
- Link store digest remains byte-identical across turn two; the sole owning mapping stays
  DSH `session-37b2...` → Claude `ec354d24...`. No replacement Session appears.
- Tool count is zero and Workspace manifest remains
  `b68ece075dc2bdc11492d8a446a20d09dcb1ac3016b573fa28e8343a3322c953`.
  Screenshot SHA-256 is
  `c87e09c44af04c75db7a187b2e52190c87fa6601153164e5a1786866ebd10fc0`.
