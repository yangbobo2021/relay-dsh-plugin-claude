# CLD-TOOL-002 — Glob, Grep, and search

## Traceability

- Primary requirement: `CLD-TOOL-002`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove that Claude can use built-in filename and content search tools inside the selected
Workspace and return one precommitted unique path/marker without outside matches.

## Fixture

- Relative path: `search/deep/needle-tool002.txt`.
- Unique content marker: `CLD_TOOL002_UNIQUE_MARKER_4Q7X9`.
- Record file bytes/digest and prove both tokens occur once in the Workspace before run.

## Method

1. In a fresh Session, require Claude to use `Glob` with `**/needle-tool002.txt`, then
   `Grep` for the unique marker (not Bash/find/rg).
2. Require exact final text:
   `SEARCH_RESULT=search/deep/needle-tool002.txt|CLD_TOOL002_UNIQUE_MARKER_4Q7X9`.
3. Inspect native content for one successful Glob and one successful Grep, their exact
   inputs/outputs/order, completed DSH activities/turn, and zero approvals.
4. Assert complete Workspace hashes and attachment objects are unchanged; self-review.

## Expected results

- Required observable: Glob finds the one relative path and Grep finds its one marker.
- Forbidden observable: Bash substitution, guessed output without both tools, outside path,
  duplicate match, wrong marker, failed tool, approval, or mutation.

## Result interpretation

- Pass only when both real built-in tools and exact final result agree.
- Fail if either tool is unavailable, incorrect, or bypassed.
- Blocked only for backend/tool infrastructure outage.
