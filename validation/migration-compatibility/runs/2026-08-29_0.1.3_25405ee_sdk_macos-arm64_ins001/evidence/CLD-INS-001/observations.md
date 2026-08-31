# Observations

- User-source fresh Session returns the instruction-only marker exactly, with zero tool activity.
- Identical no-source query after deleting the file gives a natural unknown-token explanation and contains
  zero expected marker occurrences.
- Relay passes `[user]` and `[]` exactly; both turns complete without diagnostic.
- Baseline and postcondition both have no user CLAUDE.md.
