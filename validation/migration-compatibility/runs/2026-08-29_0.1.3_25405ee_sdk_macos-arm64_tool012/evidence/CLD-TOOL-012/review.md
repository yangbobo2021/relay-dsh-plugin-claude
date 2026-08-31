# CLD-TOOL-012 Validation Review

## Reasonableness

- An isolated repo with staged, unstaged, and untracked states prevents unrelated Relay changes
  from contaminating the oracle. Separate normal/cached diffs test both index boundaries.
- Comparing semantic state plus raw index/ref and file digests catches both Git mutations and
  direct byte changes.

## Reliability

- Exact command/output/final, native structured success, DSH activity, one approval, stable HEAD,
  status, index entries, two diffs, raw index/ref bytes, working bytes, and zero object delta agree.

## Verdict

**Pass, high confidence.** Claude accurately reads Git status and both diff domains without
mutating repository, index, or working-tree state.
