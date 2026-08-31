# CLD-TOOL-015 Observations

- Allow Session: target is absent before approval; one `allowed-once` decision is followed by one
  completed Bash, exact target bytes, exact final, and a completed turn.
- Deny Session: target remains absent while approval is pending; one `rejected` decision is followed
  by a DSH/native error result, explicit not-executed final, completed turn, and continued absence
  after a safety interval. There is no retry or alternate tool.
- The allowed file remains byte-identical across the deny branch, the baseline and all unrelated
  state remain stable, and no attachment object appears.
