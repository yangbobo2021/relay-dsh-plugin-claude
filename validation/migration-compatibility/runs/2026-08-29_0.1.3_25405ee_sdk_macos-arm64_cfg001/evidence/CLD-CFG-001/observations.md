# Observations

- Relay passes `["user"]` and `[]` unchanged to the two real SDK queries.
- With user source, one exact Bash tool ID is denied before stdout and no approval request is emitted.
- With all setting sources disabled, the same exact command completes and returns the literal marker.
- The denied call appears twice in completed activity under the same ID because Claude emits both a
  permission-denied system record and its tool result. Native history confirms one invocation.
- The original settings bytes and SHA are exact after the valid run; no test temp directory remains.
