# CLD-TXT-010 Observations

- Each trial created exactly two new native Claude JSONL files. The Relay link maps the
  DSH Session to the business file once and never maps the auxiliary file.
- In the decisive trial, business native history has exactly one `user` and one
  `assistant`: the business prompt and `CLD_TXT010_SECOND_BUSINESS_OK_1010`. It has zero
  title-prompt matches and zero tool blocks.
- The other exact new native Session contains the `Generate the session title` prompt
  and the distinct answer `Auxiliary Title Isolation Test`.
- DSH persists one `session/title-llm-request` routed through Relay Claude/Sonnet, one
  provider title, one business `assistant/message`, and one completed turn. The replay
  Session ID is the linked business Session, not the auxiliary Session.
- Both native files contain an `ai-title` record. This is non-conversational Claude Code
  metadata; only `user` and `assistant` records were counted as conversation history.
- The settled UI shows the distinct generated title and only the business prompt/final.
  Workspace content remained byte-identical.
