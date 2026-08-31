# CLD-TOOL-007 Observations

- Native content contains one Bash with the exact command and no other tool.
- Its tool-result content is the exact marker. Structured result records the same stdout,
  empty stderr, `interrupted:false`, and the content block is not an error.
- DSH records one approval allowed once and one started/completed Bash whose output equals
  the marker. The turn completes with an exact non-duplicated final.
- All seven Workspace file hashes remain at the prior values and no attachment object changed.
