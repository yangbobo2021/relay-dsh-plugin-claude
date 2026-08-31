# CLD-TOOL-009 Observations

- The deciding run used Claude Code and exactly one Bash command with a 15-second wait.
- With the Bash detail expanded, 77 consecutive samples through 20.764 seconds showed the
  command running with neither output marker. At 20.961 seconds FIRST and LAST appeared together;
  no FIRST-only state occurred. The exact final appeared at 22.570 seconds.
- DSH independently records only a `started` activity and, 15.500 seconds later, one `completed`
  activity containing both output lines. The only intervening event is a title update, not output.
- Native Claude preserves correct ordered terminal stdout and exact final text. Thus command
  execution succeeds, but the required incremental presentation does not.
- All seven Workspace digests remain unchanged and no attachment object appeared.
