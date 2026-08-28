# Claude image input delivery evidence

This record validates implementation commit `e37b7be` against the image-input
acceptance requirements in `docs/spec/dsh-image-input.md`.

## Environment

- DSH: official packaged `0.1.0-rc.8`, matching the affected session log
- Plugin: packed locally from `e37b7be` as `relay-dsh-plugin-claude-0.1.1-rc.4.tgz`
- Package SHA-256: `dbaf071ea7a4f5f63b2b70433b4b02bba929dc6ff36a5a7d158f770ce1208785`
- Browser entry point: DSH Web on a fresh, isolated `DSH_HOME`
- Backend: Claude Code SDK, model alias `sonnet`
- DSH session: `session-11a96eab-eb7e-476a-9d8c-24f1b9c2bc4a`
- Export SHA-256: `22b986f24b9daa64e483e06672ec23d8b977dd3e06dda1ea2d2941832d95c907`

The screenshots and the exported session were inspected before this record was
written. The raw export is intentionally not committed because it includes
machine-local runtime metadata.

## New session image

The user pasted a fixed PNG into DSH Web and asked Claude to read the folder
name, two conversation titles, and their times.

- DSH event: `user/message` sequence 8
- Attachment: `sha256:288b87450855fafb3b638f8fb8563fe85ca9e7c2309dabd39005e7f68de2f4d1`
- Stored metadata: `image/png`, 554 x 246, 27,984 bytes
- Claude response event: sequence 21
- Claude session ID: `b28a8495-5495-4fb4-86bd-ab46d3c355d2`
- Observed answer: folder `test3`; `Greeting Session - 7min`; `搜索yangbobo2021的DSH插件 - 1h`
- Result screenshot: [01-new-session-image-result.png](./01-new-session-image-result.png)
- Screenshot SHA-256: `31e766cc373d04088425e7fbffcfaa59f58a5845876a60d4cd2d1d93576038bc`

## Continued session image

In the same DSH conversation, the user pasted a different fixed JPEG and asked
Claude to read the product title and the final two backend options.

- DSH event: `user/message` sequence 28
- Attachment: `sha256:8ebb71ec712a43197ca30f2737b450d5043be64875309e34a68343892b587476`
- Stored metadata: `image/jpeg`, 1280 x 720, 44,802 bytes
- Claude response event: sequence 39
- Claude session ID: `b28a8495-5495-4fb4-86bd-ab46d3c355d2`
- Observed answer: `DSH Local Build (b150a55)`; `Codex`; `Claude Code`
- Result screenshot: [02-continued-session-image-result.png](./02-continued-session-image-result.png)
- Screenshot SHA-256: `6bab90789d7303e733fbbdb5d7c5ef61c15532282f46ba97130eceb9e7047c1a`

The shared Claude session ID and different turn IDs demonstrate that the second
request resumed the existing SDK session instead of starting a new one.

## Supporting automated evidence

The real Web run covers new-session upload, continued-session upload, DSH
attachment persistence, SDK invocation, and image-grounded Claude responses.
The automated delivery suite additionally covers ordered multi-image content,
the exact SDK multimodal message shape, fail-before-model behavior for missing,
corrupt, and unsupported attachments, and accurate SDK/CLI capability claims.

Commands run on the implementation commit:

```text
npm test                    55 passed, 0 failed
npm run build               passed
npm pack --dry-run --json   passed
git diff --check            passed
```

`npm run verify` reaches the frontend typecheck and reports the same 14 local
DSH type-resolution errors on both `e37b7be` and unmodified `main` (`b10e7bb`).
This is a pre-existing local dependency-topology issue, not a regression in the
image-input change; the standalone production build and full test suite pass.
