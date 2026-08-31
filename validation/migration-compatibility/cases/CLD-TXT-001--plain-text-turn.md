# CLD-TXT-001 — Plain text turn

## Traceability

- Primary requirement: `CLD-TXT-001`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `L`, `W`
- Priority: `P0`

## Objective

Prove that one plain-text DSH message reaches the live Claude Agent SDK and produces
exactly one non-duplicated terminal answer in the owning DSH Session.

## Preconditions

- Plugin `0.1.3` is installed from this checkout into an isolated DSH Profile.
- A signed-in Claude account and network are available to the SDK backend.
- Workspace fixture is `fixtures/plain-text-workspace/workspace.txt` with a recorded
  digest and contains no Claude instruction/config files.
- Isolated Relay link store and DSH home are empty before the run.

## Method

1. Start official DSH with the Claude plugin, SDK backend, isolated DSH/link paths, and
   the deterministic Workspace selected through the visible directory picker.
2. Create a fresh Session, select `Claude Code`, choose `Claude Haiku` at `Low`, and send:
   `Reply with exactly CLD_TXT001_PLAIN_OK_1001. Do not call tools.`
3. Wait for terminal completion. Inspect DSH UI, the persisted DSH archive, and Claude
   link/session metadata for one user turn and one exact assistant answer.
4. Require no tool activity, duplicate terminal text, retry Session, or second Claude
   Session binding. Retain screenshot, digests, and self-review.

## Expected results

- Required observable: one exact `CLD_TXT001_PLAIN_OK_1001` final answer.
- Forbidden observable: duplicated marker, tool invocation, backend error, or a second
  Claude Session/link for the DSH Session.
- SDK/filesystem/presentation expectation: live SDK result completes and DSH persists
  one readable terminal answer without mutating the Workspace.

## Evidence to retain

- Sanitized DSH archive shape and Claude link metadata.
- Pre/post Workspace manifest and binary digests.
- Visible completed-turn screenshot.
- No credentials, authentication files, or unrelated user configuration.

## Result interpretation

- Pass when all live SDK, link, persistence, and presentation observables agree.
- Fail when the SDK executes but the answer is missing, duplicated, corrupted, or bound
  to the wrong Session.
- Blocked only when authentication, network, or Host startup prevents SDK execution.
