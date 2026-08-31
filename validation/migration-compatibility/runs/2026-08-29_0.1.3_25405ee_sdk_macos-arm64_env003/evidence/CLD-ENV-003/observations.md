# Observations

- The valid neutral command contains no value/variable name, executes once, and returns the fake environment value.
- Claude follows the non-repetition request in final text and emits no diagnostic exposure.
- Normalized SDK activity still contains the raw value once; native JSONL line 10 stores it twice in one
  user-role `tool_result` record (content plus native tool-result projection).
- Project settings are removed. The fake value is sanitized validation data, never a real credential.
