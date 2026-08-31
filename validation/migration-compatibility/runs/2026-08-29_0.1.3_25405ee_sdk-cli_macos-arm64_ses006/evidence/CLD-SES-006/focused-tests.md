# Focused production tests

- Command: `node --test test/cli-client.test.mjs test/sdk-client.test.mjs test/plugin.test.mjs test/dsh-adapter.test.mjs`
- Result: 46 passed, 0 failed, 0 skipped, 0 cancelled.
- Duration: 285.55075 ms.
- CLI-specific checks include fail-closed image/DSH-tool input, text-only metadata, process environment,
  `--session-id`/`--resume`, model, effort, permission, setting sources and isolated title arguments.
- SDK/adapter checks include multimodal ordering, SDK input validation, DSH MCP bridge, approval/question bridge,
  session persistence and backend-derived model input capabilities.
