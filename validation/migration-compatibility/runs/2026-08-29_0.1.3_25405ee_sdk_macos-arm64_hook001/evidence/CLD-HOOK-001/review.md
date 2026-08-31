# Self-review

## Process validity

- A fresh no-tool Session is a direct negative control for startup/noise records under the same user source.
- Hook evidence is written by a separate process, while SDK activity and native transcripts independently
  establish the single target tool call and output.
- The unique command marker fixes call identity; exact event count rejects duplication or broad matching.

## Result reliability

- Control and target have distinct fresh Session IDs and their transcript hashes are retained.
- Event name, tool name, tool input, Session, cwd, stdout and final all agree; no fallback tool ran.
- User settings byte restoration and temporary-log absence were checked after client completion.

## Verdict

Pass. The real Claude SDK path used by Relay honors a user-scoped PreToolUse hook exactly once for its
fixture call, without contaminating a no-tool control or leaving user state behind.
