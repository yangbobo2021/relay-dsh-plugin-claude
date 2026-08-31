# CLD-FILE-001 — Text or source attachment

## Traceability

- Primary requirement: `CLD-FILE-001`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P1`

## Objective

Prove that a user can submit a text/source file through the Claude plugin product surface
and Claude can return its undisclosed exact marker without Workspace-path access.

## Fixture

- File: `fixtures/file-input/file001-source-note.txt`, outside the selected Workspace.
- Exact second-line marker: `CLD_FILE001_MARKER_7319_KQVT`; omit it from the live prompt.
- SHA-256: `c62191203ac9f3f71f6a1b097d488d474d4a11d27f7d56ff5c01853b38b795bb`;
  byte count: `66`.

## Preconditions

- `CLD-IMG-010` is closed; use a fresh Claude Session in image-output Workspace.
- Capture composer, link, native, Session, and attachment-object baselines.

## Method

1. Inspect the fresh DSH composer for visible and hidden file/upload/attachment controls;
   open the command palette and enumerate its actions.
2. If supported, attach the exact fixture and send only: `Read the attached text file and
   reply with the exact token on its second line only. Preserve case and underscores.`
3. Require one terminal answer exactly matching the undisclosed marker, then correlate
   persisted DSH content and exact native Claude input.
4. If no file control exists, test the clipboard file-item boundary without sending a
   model turn and inspect the exact installed composer implementation and send contract.
5. Retain UI, source-boundary, state-delta, and self-review evidence.

## Expected results

- Required observable: DSH accepts/persists the text file and Claude receives its content.
- Forbidden observable: marker supplied in the prompt, Workspace discovery, silent drop,
  image-only rejection, or inferred success without native transport evidence.

## Result interpretation

- Pass only when both attachment transport and exact marker readback succeed.
- Fail when the product exposes no general file path or rejects the file before the SDK.
- Blocked only for browser/host infrastructure that prevents inspection of an otherwise
  supported attachment path.
