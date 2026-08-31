# Observations

- Runtime persisted the requested DSH policy and both real SDK queries used native `default` permission mode.
- Read completed without an interactive request; the allowed Write emitted one request and created exact bytes.
- The declined Write emitted one request and one failed tool result; its target remained absent.
- Both terminal markers were exact, the read fixture was byte-identical, and validation targets were removed.
