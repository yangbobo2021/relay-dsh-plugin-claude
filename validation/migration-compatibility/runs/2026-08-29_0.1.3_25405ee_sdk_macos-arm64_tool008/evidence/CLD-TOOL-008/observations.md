# CLD-TOOL-008 Observations

- Native content contains exactly one Bash with the exact command and one error tool result;
  there is no retry or alternate tool.
- Native result content and `toolUseResult` both preserve exit code 23 and the exact stderr
  marker. Claude then emits only the required interpretation text.
- DSH records one approval allowed once, one started Bash, one completed Bash with `error`
  status and the same output, then a normally completed owning turn.
- All seven Workspace file hashes remain at the prior values and no attachment object changed.
