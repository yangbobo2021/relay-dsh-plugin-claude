# CLD-EXT-017 Self-review

## Process review

- Two distinct marketplace directories prove independent sources rather than two entries in one source.
- The deliberate shared basename creates a real collision opportunity; fully namespaced listing and
  invocation test the intended isolation mechanism.
- Both body markers are absent from the prompt and injected only by their exact tool calls.
- Call order, tool IDs, base paths, bodies, DSH activities, and composite final are all compared.

## Reliability review

- Exact occurrence counts rule out masking and duplication; zero unnamespaced alias rules out ambiguity.
- A single final attribution field cannot represent two loaded Skills. It correctly names the last one,
  while each meta record retains reliable per-call provenance; this is documented, not overclaimed.
- Two-plugin uninstall and byte-exact configuration restoration exclude leaked source state.
- Object/Git/source invariants exclude unrelated mutation.

## Verdict

Pass. Two independent plugin sources with the same component basename load and execute under distinct
namespaces without masking, collision, reorder, or cross-body attribution.
