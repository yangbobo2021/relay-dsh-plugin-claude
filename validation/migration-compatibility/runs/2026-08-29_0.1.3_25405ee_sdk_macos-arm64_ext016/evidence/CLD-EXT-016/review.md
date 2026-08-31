# CLD-EXT-016 Self-review

## Process review

- The negative branch proves the external marker is target-triggered, not installation/session noise.
- Hook evidence comes from an external append-only file written by the bundled script, independent of
  model output and DSH presentation.
- Exact Session ID, cwd, event, tool, command and timing join the log to the intended native call.
- Native and DSH tool/result/final evidence confirms observation does not block or duplicate execution.

## Reliability review

- One negative, one event, one native Bash, and one DSH Bash lifecycle provide decisive counts.
- Timing lies strictly inside DSH start/completion and the event name is PreToolUse.
- The original approval expectation was over-broad for Claude Hook semantics and is transparently
  revised to record behavior. The zero-approval result is not ignored; it is deferred to the dedicated
  MCP/subagent permission requirement where effective-policy precedence is the primary observable.
- Exact cleanup and object/Git/source invariants exclude leaked state or unrelated mutation.

## Verdict

Pass for plugin Hook execution. The installed Hook observes exactly the selected PreToolUse event and
the turn completes correctly. Relay approval bypass is a documented permission risk, not evidence that
the Hook failed to run.
