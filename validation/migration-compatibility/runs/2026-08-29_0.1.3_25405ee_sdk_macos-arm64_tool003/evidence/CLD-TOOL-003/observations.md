# CLD-TOOL-003 Observations

- Native content contains exactly one Read and no alternate or forbidden tool.
- Read returns all three lines plus terminal empty line with its standard `line-number+Tab`
  presentation. Removing only those prefixes reconstructs the exact fixture digest.
- The assistant final contains exactly five lines. Removing only the wrapper lines yields
  the original three lines plus terminal LF and the same SHA-256.
- DSH records one started/completed Read activity and a completed turn; no approval was
  asked, no attachment object appeared, and all Workspace file digests remain unchanged.
