# CLD-EXT-008 Observations

- The fixture listens on IPv4 loopback only and reports a successful health probe before the test.
- Independent HTTP log preserves discovery, initialization, initialized notification, tool listing,
  one tools/call request, and one exact handler call, all in the same server PID.
- Native deferred metadata, exact ToolSearch, allow-once MCP call/result, final attribution, DSH
  lifecycle/output, and terminal final all agree on the HTTP server/tool and exact markers.
- No STDIO fixture process, duplicate/fallback business call, Workspace/Git change, or attachment
  object delta occurs. SIGINT is logged; listener and health endpoint close; config is removed.
