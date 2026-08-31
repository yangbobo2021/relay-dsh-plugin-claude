# CLD-IMG-006 — Image creation through Claude tools or extension

## Traceability

- Primary requirement: `CLD-IMG-006`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove that a Claude turn can use an available built-in tool to create a new, valid,
deterministically verifiable raster image inside the selected DSH Workspace.

## Preconditions

- `CLD-IMG-005` is closed; use a fresh DSH/Claude Session in `image-output-workspace`.
- The Workspace initially contains only `workspace.txt`; `generated-img006.png` does not
  exist. Record the baseline path set and per-file digest.
- Node and `sharp` are available locally; network access is unnecessary and forbidden by
  the task prompt.

## Method

1. Ask Claude to create `generated-img006.png` with exact 320×200 dimensions, magenta
   canvas, and a cyan rectangle covering the bottom-right quadrant, using available tools
   without network access.
2. Handle any normal DSH approval prompt, require at least one completed Claude tool call,
   and require exact terminal marker `CLD_IMG006_CREATED_1006`.
3. Independently decode the created file and assert PNG format/dimensions plus exact RGB
   samples in magenta and cyan regions. Require a new non-empty digest.
4. Correlate DSH tool events, native Claude tool-use/result records, Relay link/replay
   Session, completed turn, and final Workspace path/digests. Reject unrelated files.
5. Retain sanitized evidence and self-review whether the artifact was created by the
   owning turn rather than preexisting, externally generated, or merely claimed in text.

## Expected results

- Required observable: one new valid `generated-img006.png`, 320×200, with magenta
  top-left and cyan bottom-right samples, plus exact final marker.
- Forbidden observable: preexisting output, no tool call, invalid/wrong image, network
  use, unrelated file creation/mutation, failed/aborted turn, or text-only claim.
- Presentation expectation: DSH shows the creating tool activity and exact final.

## Evidence to retain

- Before/after path sets and digests; PNG metadata and pixel samples.
- Sanitized DSH/native tool summaries, identities, and UI screenshot.
- No credentials, unrelated Sessions, or unnecessary raw tool payloads.

## Result interpretation

- Pass only when tool provenance and independent artifact validation both succeed.
- Fail when no valid image is created or provenance cannot be tied to the owning turn.
- Blocked only for unavailable required local runtime/dependency or backend outage.
