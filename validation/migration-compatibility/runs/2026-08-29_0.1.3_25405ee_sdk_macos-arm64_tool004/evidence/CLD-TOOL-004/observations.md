# CLD-TOOL-004 Observations

- Target absence was established before the model turn; expected digest was computed from
  a pipeline without writing the file.
- Native content contains exactly one Write whose absolute path and 59-byte content match
  the case. No alternate tool appears.
- DSH records exactly one approval asked and one `allowed-once`, bracketed by one started
  and completed Write activity. The turn completes with the exact final marker.
- Independent `wc`, hex dump, and SHA-256 confirm all lines and terminal LF.
- Complete after-state adds only the target; the three prior files keep their known hashes,
  and no attachment object is added.
