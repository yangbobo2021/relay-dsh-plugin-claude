# Observations

- The unconfigured sibling Session generated no lifecycle log and completed with zero tools.
- The configured project generated one `SessionStart` with source `startup`, exact target Session ID and
  normalized project cwd; it occurred 369ms after local start and 5,166ms before completion.
- Target also completed with zero tools, so lifecycle firing is not conflated with a tool hook.
- Project settings and temporary log were absent before/after as applicable; no diagnostic occurred.
