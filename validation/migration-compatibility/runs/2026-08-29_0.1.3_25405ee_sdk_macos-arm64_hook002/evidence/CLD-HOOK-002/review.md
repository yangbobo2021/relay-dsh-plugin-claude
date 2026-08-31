# Self-review

## Process validity

- The same project source and fresh-session setup are used for a no-tool negative control and target.
- Capturing `tool_response.stdout`, rather than only event name/input, distinguishes completed PostToolUse
  behavior from a pre-execution observation.
- The hook writes independently of Relay SDK activity, so agreement is cross-layer evidence.

## Result reliability

- Exactly one hook record agrees with exactly one native/SDK Bash call and result, including unique marker,
  Session ID and cwd; zero records in control reject startup noise.
- Exact cleanup checks reject a persistent project configuration or log side effect.

## Verdict

Pass. Relay's real Claude SDK path honors the project-scoped PostToolUse hook once, after the selected Bash
completes, and preserves its complete response without leaking configuration.
