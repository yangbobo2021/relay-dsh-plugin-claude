# CLD-TOOL-012 Observations

- Native and DSH contain exactly one Bash with the fixed three-command read-only chain.
- Output exposes `M  staged.txt`, ` M tracked.txt`, `?? untracked.txt`, the exact unstaged
  `tracked.txt` hunk, and the exact cached `staged.txt` hunk. The exact final classifies all five.
- Before and after HEAD, raw index digest, `ls-files -s`, status, normal/cached diffs, ref digest,
  and three working-file digests are identical. No object appeared.
- One approval was allowed once and the owning turn completed normally.
