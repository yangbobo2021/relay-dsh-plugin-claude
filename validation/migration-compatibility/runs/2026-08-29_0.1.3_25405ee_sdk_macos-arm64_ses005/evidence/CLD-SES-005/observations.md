# Observations

- The valid Session has one establish and three exact filler acknowledgements before manual compact.
- PreCompact and PostCompact independently agree on Session/cwd/manual trigger; summary preserves the marker.
- Native boundary records 62,018→1,968 tokens and 60,050 cumulative dropped tokens.
- Post-compaction prompt contains no marker; exact marker-only final proves retained summary context.
- Settings/log are removed. The earlier PreCompact-only refusal is excluded from the verdict.
