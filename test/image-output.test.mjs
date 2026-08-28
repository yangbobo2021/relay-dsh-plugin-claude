import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  extractFinalAnswerImagePaths,
  promoteFinalAnswerImages,
  saveStructuredImage,
} from "../claude-image-output.js";

test("final-answer image path syntax preserves mention order and removes duplicates", () => {
  const paths = extractFinalAnswerImagePaths([
    "Generated ![first](./one.PNG) and `./folder/two with spaces.jpg`.",
    "Also see \"./three.webp\", [four](<./folder/four image.GIF>), and /tmp/five.jpeg.",
    "Duplicate: `./one.PNG`.",
    "Remote references are text only: https://example.test/remote.png and data:image/png;base64,AAAA.",
    "```text",
    "./example-only.png",
    "```",
  ].join("\n"));

  assert.deepEqual(paths, [
    "./one.PNG",
    "./folder/two with spaces.jpg",
    "./three.webp",
    "./folder/four image.GIF",
    "/tmp/five.jpeg",
  ]);
});

test("path promotion snapshots final bytes into immutable DSH attachments", async (context) => {
  const cwd = await mkdtemp(join(tmpdir(), "relay-claude-output-"));
  context.after(() => rm(cwd, { recursive: true, force: true }));
  const path = join(cwd, "result.png");
  await writeFile(path, "version-three");
  const attachments = recordingAttachments();

  const promoted = await promoteFinalAnswerImages({
    text: "The final image is `./result.png`.",
    cwd,
    attachments,
  });
  await writeFile(path, "version-four");
  await rm(path);

  assert.equal(promoted.failures.length, 0);
  assert.equal(promoted.images.length, 1);
  assert.equal(attachments.saved[0].data.toString(), "version-three");
  assert.equal(attachments.stored.get(promoted.images[0].attachmentId).toString(), "version-three");
});

test("workspace containment rejects absolute and symlink escapes without reading them", async (context) => {
  const cwd = await mkdtemp(join(tmpdir(), "relay-claude-root-"));
  const outside = await mkdtemp(join(tmpdir(), "relay-claude-outside-"));
  context.after(() => Promise.all([
    rm(cwd, { recursive: true, force: true }),
    rm(outside, { recursive: true, force: true }),
  ]));
  await writeFile(join(outside, "secret.png"), "secret");
  await symlink(join(outside, "secret.png"), join(cwd, "escape.png"));
  const attachments = recordingAttachments();

  const promoted = await promoteFinalAnswerImages({
    text: `Do not preview \`${join(outside, "secret.png")}\` or \`./escape.png\`.`,
    cwd,
    attachments,
  });

  assert.equal(promoted.images.length, 0);
  assert.deepEqual(promoted.failures.map(item => item.code), [
    "CLAUDE_IMAGE_OUTPUT_OUTSIDE_WORKSPACE",
    "CLAUDE_IMAGE_OUTPUT_OUTSIDE_WORKSPACE",
  ]);
  assert.equal(attachments.saved.length, 0);
});

test("missing paths fail explicitly while remote URLs and fenced examples are ignored", async (context) => {
  const cwd = await mkdtemp(join(tmpdir(), "relay-claude-missing-"));
  context.after(() => rm(cwd, { recursive: true, force: true }));
  const attachments = recordingAttachments();

  const promoted = await promoteFinalAnswerImages({
    text: "Missing `./missing.png`; remote https://example.test/image.png.\n```\n./sample.png\n```",
    cwd,
    attachments,
  });

  assert.deepEqual(promoted.paths, ["./missing.png"]);
  assert.equal(promoted.images.length, 0);
  assert.equal(promoted.failures[0].reason, "the file does not exist");
  assert.equal(attachments.saved.length, 0);
});

test("unsupported types, directories, and attachment validation failures stay as diagnostics", async (context) => {
  const cwd = await mkdtemp(join(tmpdir(), "relay-claude-invalid-output-"));
  context.after(() => rm(cwd, { recursive: true, force: true }));
  await writeFile(join(cwd, "vector.svg"), "<svg/>");
  await mkdir(join(cwd, "folder.png"));
  await writeFile(join(cwd, "corrupt.png"), "not a png");
  const attachments = recordingAttachments();
  const saveImage = attachments.saveImage.bind(attachments);
  attachments.saveImage = async (input) => {
    if (input.name === "corrupt.png") throw Object.assign(new Error("image content validation failed"), { code: "ATTACHMENT_INVALID" });
    return saveImage(input);
  };

  const promoted = await promoteFinalAnswerImages({
    text: "`./vector.svg` `./folder.png` `./corrupt.png`",
    cwd,
    attachments,
  });

  assert.equal(promoted.images.length, 0);
  assert.deepEqual(promoted.failures.map(item => item.code), [
    "CLAUDE_IMAGE_OUTPUT_TYPE_UNSUPPORTED",
    "CLAUDE_IMAGE_OUTPUT_NOT_FILE",
    "ATTACHMENT_INVALID",
  ]);
});

test("output image count and aggregate bytes obey DSH message limits", async (context) => {
  const cwd = await mkdtemp(join(tmpdir(), "relay-claude-output-limits-"));
  context.after(() => rm(cwd, { recursive: true, force: true }));
  await writeFile(join(cwd, "one.png"), "111");
  await writeFile(join(cwd, "two.png"), "2222");
  const countLimited = recordingAttachments();
  countLimited.imageLimits.maxImagesPerMessage = 1;
  const bytesLimited = recordingAttachments();
  bytesLimited.imageLimits.maxMessageImageBytes = 3;

  const byCount = await promoteFinalAnswerImages({
    text: "`./one.png` then `./two.png`",
    cwd,
    attachments: countLimited,
  });
  const byBytes = await promoteFinalAnswerImages({
    text: "`./one.png` then `./two.png`",
    cwd,
    attachments: bytesLimited,
  });

  assert.equal(byCount.images.length, 1);
  assert.equal(byCount.failures[0].code, "CLAUDE_IMAGE_OUTPUT_COUNT_LIMIT");
  assert.equal(byBytes.images.length, 1);
  assert.equal(byBytes.failures[0].code, "CLAUDE_IMAGE_OUTPUT_MESSAGE_TOO_LARGE");
});

test("final paths are authoritative and structured attachments are fallback-only", async (context) => {
  const cwd = await mkdtemp(join(tmpdir(), "relay-claude-priority-"));
  context.after(() => rm(cwd, { recursive: true, force: true }));
  await writeFile(join(cwd, "final.webp"), "final-file");
  const attachments = recordingAttachments();
  const fallback = imageRef("structured", "image/png", 3);

  const selected = await promoteFinalAnswerImages({
    text: "Use `./final.webp`.",
    cwd,
    attachments,
    structuredImages: [fallback],
  });
  const fallbackOnly = await promoteFinalAnswerImages({
    text: "The image is shown below.",
    cwd,
    attachments,
    structuredImages: [fallback, fallback],
  });

  assert.equal(selected.images.length, 1);
  assert.notEqual(selected.images[0].attachmentId, fallback.attachmentId);
  assert.deepEqual(fallbackOnly.images, [fallback]);
});

test("structured Base64 images use DSH validation and reject malformed data", async () => {
  const attachments = recordingAttachments();
  const validPng = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
  const ref = await saveStructuredImage({ id: "tool-1", mediaType: "image/png", data: validPng }, attachments);

  assert.equal(ref.mediaType, "image/png");
  assert.deepEqual(attachments.saved[0].data, Buffer.from(validPng, "base64"));
  await assert.rejects(
    saveStructuredImage({ id: "tool-2", mediaType: "image/png", data: "not base64" }, attachments),
    error => error.code === "CLAUDE_IMAGE_OUTPUT_INVALID",
  );
  await assert.rejects(
    saveStructuredImage({ id: "tool-3", mediaType: "image/svg+xml", data: "PHN2Zz4=" }, attachments),
    error => error.code === "CLAUDE_IMAGE_OUTPUT_INVALID",
  );
});

function recordingAttachments() {
  const stored = new Map();
  return {
    imageLimits: {
      maxImageBytes: 1024 * 1024,
      maxImagesPerMessage: 10,
      maxMessageImageBytes: 4 * 1024 * 1024,
      mediaTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
    },
    saved: [],
    stored,
    async saveImage(input) {
      const data = Buffer.from(input.data);
      this.saved.push({ ...input, data });
      const attachmentId = `sha256:${createHash("sha256").update(data).digest("hex")}`;
      stored.set(attachmentId, data);
      return imageRef(attachmentId, input.mediaType, data.length, input.name);
    },
  };
}

function imageRef(attachmentId, mediaType, bytes, name) {
  return { attachmentId, mediaType, bytes, width: 1, height: 1, ...(name ? { name } : {}) };
}
