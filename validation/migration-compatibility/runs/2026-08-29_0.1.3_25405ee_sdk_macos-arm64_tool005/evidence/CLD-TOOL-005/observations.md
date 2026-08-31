# CLD-TOOL-005 Observations

- Native content contains a read-only Read of the target followed by one Edit with
  `replace_all:false` and exact old/new strings. No Write, Bash, script, or other mutator ran.
- The original prompt prohibited all other file tools, so Read is a recorded prompt-method
  deviation. It had no mutation and returned the exact before content.
- DSH records the Read without approval, then exactly one Edit approval allowed once and one
  completed Edit activity. The exact final marker follows a completed turn.
- Independent hash/hex checks match the precomputed 50-byte after image, including terminal
  LF. Full Workspace file set is identical and every unrelated digest is unchanged.
