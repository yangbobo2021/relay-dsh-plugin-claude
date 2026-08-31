# CLD-FILE-002 — Document attachment

## Traceability

- Primary requirement: `CLD-FILE-002`
- Secondary requirements: none
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P1`

## Objective

Determine whether the Claude migration surface can read a valid PDF attachment or, if the
format is unsupported, rejects it explicitly and recoverably before any model query.

## Fixture

- File: `fixtures/file-input/file002-document.pdf`, outside the selected Workspace.
- One valid US-letter page containing undisclosed marker
  `CLD_FILE002_PDF_MARKER_8246_RZMX`.
- SHA-256: `d050177c867384bc45c2c25e04ca866f67d162b5cc32abedf6f16ac824a8e0d9`;
  byte count: `1962`.
- PDF was generated with ReportLab, inspected with `pdfinfo`/`pdfplumber`, rendered through
  Poppler, and visually checked for one legible unclipped page.

## Preconditions

- `CLD-FILE-001` is closed; start a fresh Claude composer in image-output Workspace.
- Record link/native/object/Session baselines; marker must not enter the prompt.

## Method

1. Confirm the fresh composer still has no visible or hidden general-file control.
2. Paste the exact PDF as an `application/pdf` clipboard file item and sample UI state
   through the rejection interval, retaining a screenshot.
3. If accepted, send only a marker-read instruction and require exact native transport and
   response. If rejected, require a visible format-specific or actionable rejection, no
   draft attachment, no SDK call, and a still-usable composer.
4. Corroborate behavior against the installed image-only MIME/send contract and compare
   every link/native/object/DSH delta.
5. Self-review whether an absent/silent result was incorrectly treated as explicit denial.

## Expected results

- Pass path A: PDF content reaches Claude and exact marker returns.
- Pass path B: unsupported PDF produces a clear explicit rejection without starting Claude.
- Fail: no attachment path, silent drop, image-only generic message without actionable
  document semantics, or SDK input missing the file.

## Result interpretation

- Pass requires either reliable read or explicit recoverable rejection.
- Fail when neither user task nor a clear unsupported-format outcome is available.
- Blocked only for infrastructure that prevents exercising an otherwise present PDF path.
