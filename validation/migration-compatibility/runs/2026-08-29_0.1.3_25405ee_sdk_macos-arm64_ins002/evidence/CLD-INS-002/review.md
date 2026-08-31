# Self-review

## Process validity

- Same model/source/prompt and sibling fixture parent isolate cwd/project boundary.
- Expected response appears only in configured CLAUDE.md, not the user prompt.

## Result reliability

- Exact marker versus zero occurrence and no tools is strong behavioral evidence; native cwd/transcript
  hashes exclude wrong-project execution. No user instruction exists to confound scope.

## Verdict

Pass. Project CLAUDE.md is followed only inside its project.
