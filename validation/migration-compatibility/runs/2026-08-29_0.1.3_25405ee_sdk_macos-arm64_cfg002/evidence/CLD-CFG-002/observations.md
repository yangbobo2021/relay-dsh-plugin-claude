# Observations

- Relay passes the exact shared and sibling cwd values and project-only source to the real SDK.
- Shared project: one exact Bash ID is denied before stdout. Sibling: the identical command returns the
  exact marker. Both turns complete and emit no approval request or diagnostic.
- User settings remain unchanged, excluding user-scope rules as the cause.
