# Self-review

## Process validity

- Session ID and resume metadata exclude a fresh-Session false pass. Only settings bytes change.
- Identical command, cwd, source list and approval response isolate hot reload.
- `finally` restoration plus SHA prevents fixture drift even on failure.

## Result reliability

- Subprocess stdout is authoritative; prompt finals only delimit turns.
- A then B cannot arise from a persistent child environment: each SDK query launches the Claude turn and
  the Bash subprocess observes the current setting, which is the promised per-turn reload behavior.
- Native single transcript holds both turns and outputs.

## Verdict

Pass. Supported project environment settings reload on a later turn of the active Claude Session.
