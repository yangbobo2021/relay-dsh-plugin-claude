# Claude Image Output Contract

## Problem

Claude can create or inspect an image during a turn and mention its local path in the final answer. Claude Agent SDK does not emit Codex `imageGeneration` or `imageView` items, and a filesystem path inside a text block is not a DSH image. Without an adapter conversion, DSH correctly persists and renders only the text.

## Required behavior

For a successfully completed ordinary conversation turn, the adapter performs one output conversion before emitting `finish`:

1. Select the last visible assistant text block as the final answer.
2. Extract local image paths in mention order. Accepted forms are Markdown image/link targets, inline code, quoted paths, and bare absolute or relative paths without spaces. Bare relative paths include a filename such as `football.svg` and an unprefixed directory path such as `renders/football.svg`; they do not require `./`. Natural ASCII, Markdown, and Chinese punctuation delimiters are accepted around bare paths. Fenced code, non-image Markdown targets, and URI references such as HTTP(S), data, `file:`, `ftp:`, `s3:`, or `blob:` are ignored. Recognized but unsupported image extensions produce a preview diagnostic. SVG is a supported conversion input, not a DSH output media type.
3. Resolve each path against the owning DSH Session working directory and require its real path to remain inside that directory. Symlink escapes are rejected.
4. Read the completed file once and reject a concurrent size, identity, or modification-time change. Raster bytes pass directly to the DSH attachment service. SVG bytes are rendered once, in memory, into PNG and the PNG bytes pass to the attachment service. No converted file is created in the Session workspace.
5. Emit a standard DSH assistant image block for each durable attachment, after the final text and before `finish`.

The source file is never read while rendering conversation history. A later overwrite or deletion cannot change the already persisted assistant image.

If the final answer has no local image path, structured image results from Claude tool-result events or DSH tools are fallback candidates. Existing DSH attachment references are reused; SDK Base64 image blocks are saved through the same attachment service. If final-answer paths are present, they are authoritative and unrelated structured candidates are not appended.

Failed, cancelled, and auxiliary turns do not promote output images. A recognized path that cannot be imported leaves the original answer intact and appends a stable, user-visible preview diagnostic. Duplicate path mentions and duplicate attachment IDs produce one image block.

## Security and compatibility

- Supported DSH output media types are PNG, JPEG, WebP, and GIF. SVG input always becomes PNG output.
- SVG source input is capped at the smaller of 2 MiB and DSH's configured per-image byte limit. Rendering uses 72 DPI so CSS pixel dimensions remain stable, DSH's configured pixel and dimension limits (with 64,000,000 pixels and 8192 per side as fallbacks), and a hard three-second conversion timeout.
- Only the already-snapshotted SVG byte buffer is passed to the static renderer. It receives no source filename or base URL, cannot resolve workspace-relative resources, does not fetch network resources, and does not execute scripts or event handlers.
- The converted PNG must also satisfy DSH's byte, pixel, dimension, count, aggregate-message, content-validation, and normalization policies before an image block is emitted.
- Path conversion has no effect on ordinary text with no accepted local image path.
- The adapter does not fetch network URLs and does not expose arbitrary files outside the Session workspace.
- The image block contract is provider-neutral: `{ type: "image", attachment: ImageAttachmentRef }`.
- DSH owns persistence and rendering after the adapter emits the block.

## Delivery acceptance matrix

1. Bare filenames, prefixed and unprefixed directory-relative paths, absolute paths, Markdown targets, inline-code paths, quoted paths, Windows-style paths, and mixed-case image paths are recognized in mention order, including next to natural Chinese punctuation.
2. Paths with spaces work when quoted, in inline code, or in an angle-bracket Markdown target.
3. Multiple paths preserve order; duplicate mentions produce one image.
4. HTTP(S), data URLs, fenced examples, unsupported extensions, directories, missing files, unreadable files, oversized files, and workspace escapes do not become image blocks.
5. A file edited several times during the turn is read only after turn completion; its final bytes are persisted.
6. Replacing or deleting the source after completion does not alter the durable attachment.
7. A file that changes during the snapshot is rejected instead of persisting mixed or stale bytes.
8. Existing DSH tool image attachments and Claude SDK Base64 tool-result images work as structured fallback when no final path is present.
9. Final paths take precedence over unrelated structured candidates; all output images are deduplicated.
10. Failed, cancelled, and auxiliary turns emit no promoted images.
11. Existing text-only, input-image, tool activity, approval, title, and session-continuation behavior remains unchanged.
12. Emitted block chunks assemble to a persisted assistant image block consumable by the standard DSH conversation image renderer.
13. A valid SVG becomes exactly one PNG attachment at its declared CSS-pixel dimensions; mixed SVG/raster paths retain mention order and duplicates remain deduplicated.
14. Editing or deleting the source SVG after message completion does not affect the persisted PNG attachment, and no sibling PNG is created in the workspace.
15. Malformed SVG, source/output byte overflow, dimension/pixel overflow, timeout, or rasterizer failure leaves the answer intact and emits a stable diagnostic without a partial image block.
16. SVG scripts and event handlers never execute, and local or network resource references are not loaded during conversion.
17. Ordinary non-image Markdown links and image-looking URI schemes do not become local path candidates or suppress structured-image fallback.
