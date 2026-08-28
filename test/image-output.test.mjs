import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import sharp from "sharp";

import {
  extractFinalAnswerImagePaths,
  promoteFinalAnswerImages,
  rasterizeSvgToPng,
  saveStructuredImage,
} from "../claude-image-output.js";

test("final-answer image path syntax preserves mention order and removes duplicates", () => {
  const paths = extractFinalAnswerImagePaths([
    "Generated ![first](./one.PNG) and `./folder/two with spaces.jpg`.",
    "Also see \"./three.webp\", [four](<./folder/four image.GIF>), /tmp/five.jpeg, and `./six.SVG`.",
    "Natural output: football.svg, assets/render/final.png，and 输出/足球图.WEBP。",
    "Windows output: .\\renders\\pitch.gif and C:\\workspace\\goal.JPG.",
    "Markdown emphasis: **preview.avif** and ~~alternate.heic~~.",
    "Chinese wrappers:（round.svg），labels：scoreboard.png。",
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
    "./six.SVG",
    "football.svg",
    "assets/render/final.png",
    "输出/足球图.WEBP",
    ".\\renders\\pitch.gif",
    "C:\\workspace\\goal.JPG",
    "preview.avif",
    "alternate.heic",
    "round.svg",
    "scoreboard.png",
  ]);
});

test("non-image links and remote image URIs are not local image candidates", () => {
  const paths = extractFinalAnswerImagePaths([
    "Read [the guide](README.md), [the site](https://example.test), and [remote art](https://example.test/art.png).",
    "Ignore ftp://example.test/art.png, s3://bucket/art.webp, file:///tmp/art.gif, and data:image/png;base64,AAAA.",
    "Contact mailto:preview@example.png or inspect blob:https://example.test/id.svg.",
    "A compound extension such as package.svg.js is not an image path.",
  ].join("\n"));

  assert.deepEqual(paths, []);
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

test("SVG paths are rasterized once into immutable PNG attachments", async (context) => {
  const cwd = await mkdtemp(join(tmpdir(), "relay-claude-svg-output-"));
  context.after(() => rm(cwd, { recursive: true, force: true }));
  const source = join(cwd, "final.svg");
  await writeFile(source, svg(12, 8, '<rect width="12" height="8" fill="#1565c0"/>'));
  const attachments = recordingAttachments();

  const promoted = await promoteFinalAnswerImages({
    text: "Generated `./final.svg`, again `./final.svg`.",
    cwd,
    attachments,
  });
  const storedBeforeSourceChange = Buffer.from(attachments.saved[0].data);
  await writeFile(source, svg(12, 8, '<rect width="12" height="8" fill="#d32f2f"/>'));
  await rm(source);
  const metadata = await sharp(storedBeforeSourceChange).metadata();

  assert.equal(promoted.failures.length, 0);
  assert.equal(promoted.images.length, 1);
  assert.equal(attachments.saved.length, 1);
  assert.equal(attachments.saved[0].mediaType, "image/png");
  assert.equal(attachments.saved[0].name, "final.png");
  assert.deepEqual({ format: metadata.format, width: metadata.width, height: metadata.height }, {
    format: "png",
    width: 12,
    height: 8,
  });
  assert.deepEqual(attachments.stored.get(promoted.images[0].attachmentId), storedBeforeSourceChange);
  await assert.rejects(access(join(cwd, "final.png")), error => error.code === "ENOENT");
});

test("a bare SVG filename in natural assistant prose is rasterized", async (context) => {
  const cwd = await mkdtemp(join(tmpdir(), "relay-claude-svg-bare-output-"));
  context.after(() => rm(cwd, { recursive: true, force: true }));
  await writeFile(join(cwd, "football.svg"), svg(16, 10, '<rect width="16" height="10" fill="#ffffff"/>'));
  const attachments = recordingAttachments();

  const promoted = await promoteFinalAnswerImages({
    text: "已在 football.svg 中创建了一张简单的足球图片。",
    cwd,
    attachments,
  });

  assert.deepEqual(promoted.paths, ["football.svg"]);
  assert.equal(promoted.failures.length, 0);
  assert.equal(promoted.images.length, 1);
  assert.equal(promoted.images[0].name, "football.png");
  assert.deepEqual(await sharp(attachments.saved[0].data).metadata().then(({ format, width, height }) => ({ format, width, height })), {
    format: "png",
    width: 16,
    height: 10,
  });
});

test("mixed SVG and raster paths retain order while duplicate paths stay deduplicated", async (context) => {
  const cwd = await mkdtemp(join(tmpdir(), "relay-claude-svg-order-"));
  context.after(() => rm(cwd, { recursive: true, force: true }));
  await writeFile(join(cwd, "first.svg"), svg(3, 2, '<rect width="3" height="2" fill="#1565c0"/>'));
  await sharp({
    create: { width: 2, height: 2, channels: 4, background: "#d32f2f" },
  }).png().toFile(join(cwd, "second.png"));
  const attachments = recordingAttachments();

  const promoted = await promoteFinalAnswerImages({
    text: "`./first.svg`, then `./second.png`, then `./first.svg`.",
    cwd,
    attachments,
  });

  assert.equal(promoted.failures.length, 0);
  assert.deepEqual(attachments.saved.map(item => item.name), ["first.png", "second.png"]);
  assert.deepEqual(promoted.images.map(item => item.name), ["first.png", "second.png"]);
});

test("SVG rasterization does not fetch external resources or execute active content", async (context) => {
  let requests = 0;
  const server = createServer((_request, response) => {
    requests += 1;
    response.writeHead(200, { "content-type": "image/png" });
    response.end("not reached");
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  context.after(() => new Promise(resolve => server.close(resolve)));
  const address = server.address();
  const cwd = await mkdtemp(join(tmpdir(), "relay-claude-svg-external-"));
  context.after(() => rm(cwd, { recursive: true, force: true }));
  const localResource = join(cwd, "external.png");
  await sharp({
    create: { width: 20, height: 20, channels: 4, background: "#ff0000" },
  }).png().toFile(localResource);
  const activeSvg = svg(20, 20, [
    '<script>globalThis.__svgExecuted = true</script>',
    '<rect width="20" height="20" fill="#ffffff" onload="globalThis.__svgLoaded = true"/>',
    `<image href="http://127.0.0.1:${address.port}/external.png" width="20" height="20"/>`,
    `<image href="file://${localResource}" width="20" height="20"/>`,
  ].join(""));
  await writeFile(join(cwd, "active.svg"), activeSvg);
  const attachments = recordingAttachments();

  const promoted = await promoteFinalAnswerImages({ text: "`./active.svg`", cwd, attachments });
  const firstPixel = await sharp(attachments.saved[0].data).raw().toBuffer();

  assert.equal(promoted.failures.length, 0);
  assert.equal(promoted.images.length, 1);
  assert.equal(requests, 0);
  assert.deepEqual([...firstPixel.subarray(0, 4)], [255, 255, 255, 255]);
  assert.equal(globalThis.__svgExecuted, undefined);
  assert.equal(globalThis.__svgLoaded, undefined);
});

test("SVG external entities are rejected without producing an attachment", async (context) => {
  const cwd = await mkdtemp(join(tmpdir(), "relay-claude-svg-entity-"));
  context.after(() => rm(cwd, { recursive: true, force: true }));
  await writeFile(join(cwd, "entity.svg"), [
    '<!DOCTYPE svg [<!ENTITY external SYSTEM "file:///etc/passwd">]>',
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">',
    '<text x="0" y="12">&external;</text>',
    '</svg>',
  ].join(""));
  const attachments = recordingAttachments();

  const promoted = await promoteFinalAnswerImages({ text: "`./entity.svg`", cwd, attachments });

  assert.equal(promoted.images.length, 0);
  assert.equal(promoted.failures[0].code, "CLAUDE_IMAGE_OUTPUT_SVG_INVALID");
  assert.equal(attachments.saved.length, 0);
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
  await writeFile(join(cwd, "vector.bmp"), "not a supported image");
  await mkdir(join(cwd, "folder.png"));
  await writeFile(join(cwd, "corrupt.png"), "not a png");
  const attachments = recordingAttachments();
  const saveImage = attachments.saveImage.bind(attachments);
  attachments.saveImage = async (input) => {
    if (input.name === "corrupt.png") throw Object.assign(new Error("image content validation failed"), { code: "ATTACHMENT_INVALID" });
    return saveImage(input);
  };

  const promoted = await promoteFinalAnswerImages({
    text: "`./vector.bmp` `./folder.png` `./corrupt.png`",
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

test("invalid, oversized, over-dimensioned, and timed-out SVG conversions are explicit", async (context) => {
  const cwd = await mkdtemp(join(tmpdir(), "relay-claude-svg-invalid-"));
  context.after(() => rm(cwd, { recursive: true, force: true }));
  await writeFile(join(cwd, "invalid.svg"), "<svg><broken></svg>");
  await writeFile(join(cwd, "large.svg"), svg(4, 4, `<desc>${"x".repeat(256)}</desc>`));
  await writeFile(join(cwd, "wide.svg"), svg(20, 4, ""));
  await writeFile(join(cwd, "pixels.svg"), svg(5, 5, ""));
  await writeFile(join(cwd, "slow.svg"), svg(4, 4, ""));

  const invalid = await promoteFinalAnswerImages({
    text: "`./invalid.svg`",
    cwd,
    attachments: recordingAttachments(),
  });
  const sizeAttachments = recordingAttachments();
  sizeAttachments.imageLimits.maxImageBytes = 128;
  const oversized = await promoteFinalAnswerImages({
    text: "`./large.svg`",
    cwd,
    attachments: sizeAttachments,
  });
  const dimensionAttachments = recordingAttachments();
  dimensionAttachments.imageLimits.maxImageDimension = 8;
  const overDimensioned = await promoteFinalAnswerImages({
    text: "`./wide.svg`",
    cwd,
    attachments: dimensionAttachments,
  });
  const pixelAttachments = recordingAttachments();
  pixelAttachments.imageLimits.maxImagePixels = 16;
  const overPixels = await promoteFinalAnswerImages({
    text: "`./pixels.svg`",
    cwd,
    attachments: pixelAttachments,
  });
  const timedOut = await promoteFinalAnswerImages({
    text: "`./slow.svg`",
    cwd,
    attachments: recordingAttachments(),
    svgRasterizer: async () => {
      throw Object.assign(new Error("SVG conversion exceeded the time limit"), {
        code: "CLAUDE_IMAGE_OUTPUT_SVG_TIMEOUT",
      });
    },
  });

  assert.equal(invalid.failures[0].code, "CLAUDE_IMAGE_OUTPUT_SVG_INVALID");
  assert.equal(oversized.failures[0].code, "CLAUDE_IMAGE_OUTPUT_TOO_LARGE");
  assert.equal(overDimensioned.failures[0].code, "CLAUDE_IMAGE_OUTPUT_SVG_DIMENSIONS");
  assert.equal(overPixels.failures[0].code, "CLAUDE_IMAGE_OUTPUT_SVG_DIMENSIONS");
  assert.equal(timedOut.failures[0].code, "CLAUDE_IMAGE_OUTPUT_SVG_TIMEOUT");
});

test("converted PNG bytes must fit the configured DSH per-image limit", async () => {
  await assert.rejects(
    rasterizeSvgToPng(Buffer.from(svg(4, 4, '<rect width="4" height="4" fill="#1565c0"/>')), {
      maxBytes: 8,
      maxPixels: 64,
      maxDimension: 8,
    }),
    error => error.code === "CLAUDE_IMAGE_OUTPUT_TOO_LARGE",
  );
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
    text: "The image is shown below; see [the guide](README.md).",
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
      maxImagePixels: 64_000_000,
      maxImageDimension: 8192,
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

function svg(width, height, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`;
}

function imageRef(attachmentId, mediaType, bytes, name) {
  return { attachmentId, mediaType, bytes, width: 1, height: 1, ...(name ? { name } : {}) };
}
