# CLD-IMG-010 Observations

- The pre-turn Workspace contained exactly the source PNG, safe SVG, and text marker;
  target and helpers were absent.
- Claude used six local tools: an initial Bash inspection, two helper Writes, two Bash
  executions, and one exact helper-cleanup Bash. Five mutating/execution actions surfaced
  approvals and all were allowed once; all six tool results succeeded.
- Claude's edit reported 48,000 replacements and 16,000 preserved pixels. Its separate
  verifier reported exactly the intended two target colors and the unchanged source hash.
- Independent post-turn decoding reproduced those counts and checked both sides of the
  x=160/y=100 boundary. Target differs from source and contains no source magenta.
- The complete after-Workspace adds only `edited-img010.png`; source, SVG, and text hashes
  equal their prior evidence, both helpers are gone, and no attachment object was created.
- DSH completed one turn and displayed the exact terminal marker without path promotion.
