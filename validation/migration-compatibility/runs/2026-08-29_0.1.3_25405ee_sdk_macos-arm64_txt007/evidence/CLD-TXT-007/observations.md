# CLD-TXT-007 Observations

- First eligible partial sample occurs at `7,147ms`; Stop is clicked at `7,454ms`.
- At `0.6s`, `3s`, and `12s` after the click, Stop is absent, answer text is `285`
  characters, and `CLD_STOP_END_1007` is absent. The 3-to-12-second length is stable.
- Archive records `turn/end` as `aborted` with user reason. Partial terminal text has the
  begin marker, only six numbered lines plus a cut token, and no end marker.
- The end-marker string exists only in the typed reasoning block because Claude inferred
  the compositional instruction; it never appears in assistant `text` blocks or answer UI.
- Same Session later completes exact `CLD_STOP_RECOVERED_1007`; link digest stays fixed
  and tools remain zero. Workspace manifest remains unchanged.
- Stopped/recovered screenshot SHA-256 values are
  `7c549f7fabc00caea281f4ec8832bf02396a7fedfd63c1d258c10d45c9892cbc` and
  `75dd1c41f213f62816fdd5943013e69e225ab9abe41593e4a4f7732014d370cd`.
