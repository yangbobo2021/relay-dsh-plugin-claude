# CLD-TOOL-010 Observations

- The deciding Session requested one Bash and one approval; the approval was allowed once.
- The exact immediate started file appeared, proving the shell crossed its first command. Stop was
  clicked once 303ms later, well before the 15-second delayed branch.
- After 18.797 seconds, DSH still shows `已停止`, no late output/final is visible, no matching
  process exists, and `tool010-late.txt` remains absent. The started file has the exact digest;
  all baseline and prior files remain byte-identical.
- DSH persists a user-aborted turn, with one started and zero completed activity events. Native
  Claude persists an error result and no final, but labels it `User rejected tool use` despite the
  preceding allow-once event. This wording is inaccurate but does not mask continued execution.
