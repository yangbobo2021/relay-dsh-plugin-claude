# CLD-TOOL-012 — Git inspection

## Traceability

- Primary requirement: `CLD-TOOL-012`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove that Claude can inspect an isolated repository's staged, unstaged, and untracked state and
both diff domains without changing HEAD, index semantics, or working-tree bytes.

## Method

1. Create an isolated nested Git fixture with one committed baseline. Precondition it with one
   staged modification, one unstaged modification, and one untracked file. Capture HEAD,
   porcelain status, `ls-files -s`, normal/cached diffs, refs, and all file hashes.
2. In a fresh Claude Code Session require only Bash to run exactly:
   `git -C git/tool012-repo status --short && git -C git/tool012-repo diff -- tracked.txt &&
   git -C git/tool012-repo diff --cached -- staged.txt`.
3. Require the exact interpretation
   `GIT_RESULT=stagedM|workingM|untracked|workingDiff|cachedDiff`, allow once if requested, and
   inspect native/DSH command, output, approval, final, and completion.
4. Recompute the complete semantic Git and byte baselines and self-review.

## Expected results

- Required observable: output exposes all three status classes and the matching normal/cached
  diffs; exact final agrees; HEAD, refs, index entries, diffs, and working bytes are unchanged.
- Forbidden observable: checkout/add/reset/commit or other mutation, missing/misattributed state,
  fallback/extra tool, repository escape, or interpretation unsupported by actual Git output.

## Result interpretation

- Pass only when inspection correctness and before/after immutability both pass.
- Fail on inaccurate status/diff interpretation or semantic repository/index mutation.
- Blocked only for backend/tool infrastructure outage.
