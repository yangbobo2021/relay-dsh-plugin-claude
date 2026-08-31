# CLD-TOOL-009 Validation Review

## Reasonableness

- Two unique markers separated by 15 seconds create an unambiguous window in which real
  streaming must show FIRST while LAST is impossible. Expanding tool detail before that window
  and sampling continuously tests user-visible behavior directly.
- Native terminal output and DSH timestamps distinguish execution correctness from presentation.

## Reliability

- The deciding run is one uninterrupted Claude Code operation. Eighty-six live samples, a
  running screenshot, final screenshot, native result, and DSH event sequence agree: there is no
  output-bearing event or visible output before completion, then both lines arrive together.
- The earlier short/split trials and the accidentally selected Standard-mode attempt are excluded,
  so they cannot bias the verdict. Stable Workspace/object state rules out side effects.

## Verdict

**Fail, high confidence.** Long-running Bash completes correctly, but its stdout is buffered until
completion and therefore does not satisfy intermediate-output visibility.
