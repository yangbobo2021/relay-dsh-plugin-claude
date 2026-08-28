# Claude Image Output Contract

## Problem

Claude can create or inspect an image during a turn and mention its local path in the final answer. Claude Agent SDK does not emit Codex `imageGeneration` or `imageView` items, and a filesystem path inside a text block is not a DSH image. Without an adapter conversion, DSH correctly persists and renders only the text.

## Required behavior

For a successfully completed ordinary conversation turn, the adapter performs one output conversion before emitting `finish`:

1. Select the last visible assistant text block as the final answer.
2. Extract local image paths in mention order. Accepted forms are Markdown image/link targets, inline code, quoted paths, and bare absolute or relative paths without spaces. Fenced code is ignored. Remote, data, and `file:` URLs are ignored. Recognized but unsupported image extensions produce a preview diagnostic.
3. Resolve each path against the owning DSH Session working directory and require its real path to remain inside that directory. Symlink escapes are rejected.
4. Read the completed file once, reject a concurrent size or modification-time change, and pass the bytes to the DSH attachment service. The attachment service remains responsible for content validation, normalization, dimensions, and configured limits.
5. Emit a standard DSH assistant image block for each durable attachment, after the final text and before `finish`.

The source file is never read while rendering conversation history. A later overwrite or deletion cannot change the already persisted assistant image.

If the final answer has no local image path, structured image results from Claude tool-result events or DSH tools are fallback candidates. Existing DSH attachment references are reused; SDK Base64 image blocks are saved through the same attachment service. If final-answer paths are present, they are authoritative and unrelated structured candidates are not appended.

Failed, cancelled, and auxiliary turns do not promote output images. A recognized path that cannot be imported leaves the original answer intact and appends a stable, user-visible preview diagnostic. Duplicate path mentions and duplicate attachment IDs produce one image block.

## Security and compatibility

- Supported output media types are PNG, JPEG, WebP, and GIF.
- Path conversion has no effect on ordinary text with no accepted local image path.
- The adapter does not fetch network URLs and does not expose arbitrary files outside the Session workspace.
- The image block contract is provider-neutral: `{ type: "image", attachment: ImageAttachmentRef }`.
- DSH owns persistence and rendering after the adapter emits the block.

## Delivery acceptance matrix

1. Relative, absolute, Markdown, inline-code, quoted, and mixed-case image paths are recognized in mention order.
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
