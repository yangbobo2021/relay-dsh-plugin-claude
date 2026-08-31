# CLD-FILE-001 Installed DSH Boundary

Tested source:
`@deepseek-ai/dsh-client-ui-conversation/lib/client.js` from official DSH `0.1.0-rc.8`.

- Installed file SHA-256:
  `dc48b35b74c71ddfe321d5a8e2604bbbbbc7e5136876740616ef4292b4e61b52`.
- Paste handling filters clipboard items with `kind === "file"`, converts them to browser
  Files, and sends all such files to `intakeImages`.
- `createDraftImages` calls `imageMediaType(file.type)` for every file. The switch accepts
  only `image/png`, `image/jpeg`, `image/webp`, and `image/gif`; every other MIME throws.
- The default `sendSession` API takes text plus `imageIds`, resolves only draft images,
  serializes them, and submits image blocks followed by optional text. There is no general
  document/file ID or byte payload in this contract.

The source behavior explains the live empty draft and rules out a hidden text-file path.
