# CLD-TOOL-013 Observations

- Independent source calibration returned HTTP 200 and exact `<h1>Example Domain</h1>`.
- Native Claude contains exactly ToolSearch `select:WebFetch`, its WebFetch reference, then one
  WebFetch for the exact URL. Structured result records code 200, 559 bytes, and the exact heading.
- DSH mirrors both tool lifecycles, one WebFetch approval allowed once, and a completed turn with
  exact supported final. No Bash, curl, wget, WebSearch, browser, or other fallback occurred.
- Workspace content, nested Git semantic state/index, and attachment-object state are unchanged.
