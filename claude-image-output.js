import { basename, extname, isAbsolute, relative, resolve, sep } from "node:path";
import { open, realpath, stat } from "node:fs/promises";
import sharp from "sharp";

const MEDIA_TYPES = new Map([
  [".gif", "image/gif"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
]);

const IMAGE_SUFFIX = String.raw`\.(?:png|jpe?g|webp|gif|bmp|svg|tiff?|avif|heic)`;
const IMAGE_PATH_END = new RegExp(`${IMAGE_SUFFIX}$`, "i");
const BARE_PATH_BOUNDARY = String.raw`[\s(\[{:*=~（【《「『“‘，。；：！？、]`;
const BARE_PATH_END_CHAR = String.raw`[\s)\]}>,;:!?*~，。；：！？、）】》」』”’]`;
const BARE_PATH_END = String.raw`(?:${BARE_PATH_END_CHAR}|\.(?=$|${BARE_PATH_END_CHAR}))`;
const BARE_PATH_CONTENT = String.raw`[^\s<>"'“”‘’「」『』*~()\[\]{}=:,;!?，。；：！？、（）【】《》]+?`;
const MARKDOWN_PATH = new RegExp(String.raw`!?\[[^\]\r\n]*\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+["'][^"']*["'])?\s*\)`, "gi");
const INLINE_CODE_PATH = new RegExp("`([^`\\r\\n]+" + IMAGE_SUFFIX + ")`", "gi");
const QUOTED_PATH = new RegExp("[\"']([^\"'\\r\\n]+" + IMAGE_SUFFIX + ")[\"']", "gi");
const URI_REFERENCE = /(?!(?:[a-z]:[\\/]))(?:[a-z][a-z0-9+.-]*:\/\/|data:|file:|blob:|mailto:|\/\/)[^\s<>"'“”‘’]+/gi;
const SVG_EXTENSION = ".svg";
const SVG_SOURCE_MAX_BYTES = 2 * 1024 * 1024;
const SVG_RASTER_DENSITY = 72;
const SVG_RASTER_TIMEOUT_SECONDS = 3;
const DEFAULT_MAX_IMAGE_PIXELS = 64_000_000;
const DEFAULT_MAX_IMAGE_DIMENSION = 8192;

export function extractFinalAnswerImagePaths(text) {
  const visible = withoutFencedCode(String(text ?? ""));
  const matches = [];
  collectMatches(matches, visible, MARKDOWN_PATH, 1, 2);
  collectMatches(matches, visible, INLINE_CODE_PATH, 1);
  collectMatches(matches, visible, QUOTED_PATH, 1);
  const bareVisible = maskMatches(visible, MARKDOWN_PATH, INLINE_CODE_PATH, QUOTED_PATH, URI_REFERENCE);
  collectMatches(
    matches,
    bareVisible,
    new RegExp(String.raw`(?:^|${BARE_PATH_BOUNDARY})((?:[a-z]:[\\/])?${BARE_PATH_CONTENT}${IMAGE_SUFFIX})(?=$|${BARE_PATH_END})`, "gi"),
    1,
  );
  matches.sort((left, right) => left.index - right.index);
  const seen = new Set();
  return matches.flatMap(({ path }) => {
    const normalized = normalizeMention(path);
    if (!normalized || !IMAGE_PATH_END.test(normalized) || isRemoteReference(normalized) || seen.has(normalized)) return [];
    seen.add(normalized);
    return [normalized];
  });
}

export async function promoteFinalAnswerImages({
  text,
  cwd,
  attachments,
  structuredImages = [],
  structuredImageData = [],
  signal,
  svgRasterizer = rasterizeSvgToPng,
}) {
  const paths = extractFinalAnswerImagePaths(text);
  if (paths.length === 0) {
    const images = [...structuredImages];
    const failures = [];
    for (const [index, image] of deduplicateStructuredImages(structuredImageData).entries()) {
      try {
        images.push(await saveStructuredImage({ ...image, id: image.id ?? `structured-${index}` }, attachments, signal));
      } catch (error) {
        if (signal?.aborted) throw signal.reason ?? error;
        failures.push(failure(
          image.name ?? `Claude structured image ${index + 1}`,
          error.code ?? "CLAUDE_IMAGE_OUTPUT_IMPORT_FAILED",
          error.message ?? "the structured image could not be imported",
        ));
      }
    }
    const admitted = applyOutputLimits(deduplicateAttachments(images), attachments);
    return { paths, images: admitted.images, failures: [...failures, ...admitted.failures] };
  }
  if (typeof attachments?.saveImage !== "function") {
    return {
      paths,
      images: [],
      failures: paths.map(path => failure(path, "CLAUDE_IMAGE_OUTPUT_ATTACHMENTS_UNAVAILABLE", "the DSH attachment service is unavailable")),
    };
  }

  const images = [];
  const failures = [];
  for (const path of paths) {
    signal?.throwIfAborted();
    try {
      images.push(await snapshotWorkspaceImage(path, cwd, attachments, signal, svgRasterizer));
    } catch (error) {
      if (signal?.aborted) throw signal.reason ?? error;
      failures.push(failure(path, error.code ?? "CLAUDE_IMAGE_OUTPUT_IMPORT_FAILED", outputFailureReason(error)));
    }
  }
  const admitted = applyOutputLimits(deduplicateAttachments(images), attachments);
  return { paths, images: admitted.images, failures: [...failures, ...admitted.failures] };
}

export async function saveStructuredImage(image, attachments, signal) {
  signal?.throwIfAborted();
  if (typeof attachments?.saveImage !== "function") {
    throw outputImageError("the DSH attachment service is unavailable", "CLAUDE_IMAGE_OUTPUT_ATTACHMENTS_UNAVAILABLE");
  }
  if (!MEDIA_TYPES.has(extensionForMediaType(image?.mediaType)) || typeof image?.data !== "string") {
    throw outputImageError("Claude returned invalid structured image data", "CLAUDE_IMAGE_OUTPUT_INVALID");
  }
  const data = decodeBase64(image.data);
  return attachments.saveImage({
    data,
    mediaType: image.mediaType,
    name: image.name ?? `claude-${image.id ?? "image"}.${extensionForMediaType(image.mediaType).slice(1)}`,
  });
}

export async function materializeDshToolImages(result, attachments, signal) {
  const content = [];
  const attachmentsFound = [];
  for (const block of result?.content ?? []) {
    if (block?.type !== "image" || !block.attachment) {
      content.push(block);
      continue;
    }
    signal?.throwIfAborted();
    if (typeof attachments?.readImage !== "function") {
      throw outputImageError("the DSH attachment service is unavailable", "CLAUDE_IMAGE_OUTPUT_ATTACHMENTS_UNAVAILABLE");
    }
    const stored = await attachments.readImage(block.attachment, signal);
    if (!(stored?.data instanceof Uint8Array) || !stored?.ref?.mediaType) {
      throw outputImageError("the DSH attachment store returned invalid image data", "CLAUDE_IMAGE_OUTPUT_INVALID");
    }
    attachmentsFound.push(stored.ref);
    content.push({
      type: "image",
      data: Buffer.from(stored.data).toString("base64"),
      mediaType: stored.ref.mediaType,
    });
  }
  return {
    result: { ...result, content },
    attachments: attachmentsFound,
  };
}

async function snapshotWorkspaceImage(path, cwd, attachments, signal, svgRasterizer) {
  const root = await realpath(resolve(cwd ?? process.cwd()));
  const target = await realpath(resolve(root, path));
  const targetRelative = relative(root, target);
  if (targetRelative === ".." || targetRelative.startsWith(`..${sep}`) || isAbsolute(targetRelative)) {
    throw outputImageError("the path is outside the session workspace", "CLAUDE_IMAGE_OUTPUT_OUTSIDE_WORKSPACE");
  }
  const extension = extname(target).toLowerCase();
  const mediaType = MEDIA_TYPES.get(extension);
  const isSvg = extension === SVG_EXTENSION;
  if (!mediaType && !isSvg) {
    throw outputImageError("the image type is unsupported", "CLAUDE_IMAGE_OUTPUT_TYPE_UNSUPPORTED");
  }
  const handle = await open(target, "r");
  let data;
  try {
    const before = await handle.stat();
    if (!before.isFile()) throw outputImageError("the path is not a file", "CLAUDE_IMAGE_OUTPUT_NOT_FILE");
    const configuredMaxBytes = attachments.imageLimits?.maxImageBytes;
    const maxBytes = isSvg
      ? Math.min(validLimit(configuredMaxBytes, Number.POSITIVE_INFINITY), SVG_SOURCE_MAX_BYTES)
      : configuredMaxBytes;
    if (Number.isSafeInteger(maxBytes) && before.size > maxBytes) {
      throw outputImageError("the image exceeds the configured size limit", "CLAUDE_IMAGE_OUTPUT_TOO_LARGE");
    }
    signal?.throwIfAborted();
    data = await handle.readFile();
    signal?.throwIfAborted();
    const [after, pathAfter, realPathAfter] = await Promise.all([
      handle.stat(),
      stat(target),
      realpath(target),
    ]);
    if (
      before.size !== after.size
      || before.mtimeMs !== after.mtimeMs
      || before.ctimeMs !== after.ctimeMs
      || before.ino !== after.ino
      || after.ino !== pathAfter.ino
      || after.dev !== pathAfter.dev
      || data.byteLength !== after.size
      || realPathAfter !== target
    ) {
      throw outputImageError("the image changed while Claude was finishing its answer", "CLAUDE_IMAGE_OUTPUT_CHANGED_DURING_READ");
    }
  } finally {
    await handle.close();
  }
  if (isSvg) {
    const rendered = await svgRasterizer(data, svgRasterLimits(attachments), signal);
    return attachments.saveImage({
      data: rendered,
      mediaType: "image/png",
      name: `${basename(target, extension)}.png`,
    });
  }
  return attachments.saveImage({ data, mediaType, name: basename(target) });
}

export async function rasterizeSvgToPng(data, limits = {}, signal) {
  signal?.throwIfAborted();
  const maxPixels = validLimit(limits.maxPixels, DEFAULT_MAX_IMAGE_PIXELS);
  const maxDimension = validLimit(limits.maxDimension, DEFAULT_MAX_IMAGE_DIMENSION);
  const maxBytes = validLimit(limits.maxBytes, Number.POSITIVE_INFINITY);
  try {
    const pipeline = sharp(data, {
      density: SVG_RASTER_DENSITY,
      failOn: "error",
      limitInputPixels: maxPixels,
      sequentialRead: true,
      unlimited: false,
    }).timeout({ seconds: SVG_RASTER_TIMEOUT_SECONDS });
    const metadata = await pipeline.metadata();
    validateSvgMetadata(metadata, maxPixels, maxDimension);
    signal?.throwIfAborted();
    const { data: png, info } = await pipeline
      .png({ adaptiveFiltering: true, compressionLevel: 9 })
      .toBuffer({ resolveWithObject: true });
    signal?.throwIfAborted();
    validateRasterDimensions(info.width, info.height, maxPixels, maxDimension);
    if (png.byteLength > maxBytes) {
      throw outputImageError("the converted PNG exceeds the configured size limit", "CLAUDE_IMAGE_OUTPUT_TOO_LARGE");
    }
    return png;
  } catch (error) {
    if (signal?.aborted) throw signal.reason ?? error;
    if (error?.code?.startsWith("CLAUDE_IMAGE_OUTPUT_")) throw error;
    if (/timeout/i.test(error?.message ?? "")) {
      throw outputImageError("SVG conversion exceeded the time limit", "CLAUDE_IMAGE_OUTPUT_SVG_TIMEOUT");
    }
    if (/pixel limit|dimensions? exceed|width or height/i.test(error?.message ?? "")) {
      throw outputImageError("the SVG exceeds the configured pixel dimensions", "CLAUDE_IMAGE_OUTPUT_SVG_DIMENSIONS");
    }
    throw outputImageError("the SVG is invalid or cannot be rendered safely", "CLAUDE_IMAGE_OUTPUT_SVG_INVALID");
  }
}

function svgRasterLimits(attachments) {
  return {
    maxBytes: validLimit(attachments?.imageLimits?.maxImageBytes, Number.POSITIVE_INFINITY),
    maxPixels: validLimit(attachments?.imageLimits?.maxImagePixels, DEFAULT_MAX_IMAGE_PIXELS),
    maxDimension: validLimit(attachments?.imageLimits?.maxImageDimension, DEFAULT_MAX_IMAGE_DIMENSION),
  };
}

function validateSvgMetadata(metadata, maxPixels, maxDimension) {
  if (metadata?.format !== "svg") {
    throw outputImageError("the file extension is SVG but its content is not", "CLAUDE_IMAGE_OUTPUT_SVG_INVALID");
  }
  validateRasterDimensions(metadata.width, metadata.height, maxPixels, maxDimension);
}

function validateRasterDimensions(width, height, maxPixels, maxDimension) {
  if (!Number.isSafeInteger(width) || width <= 0 || !Number.isSafeInteger(height) || height <= 0) {
    throw outputImageError("the SVG does not have valid pixel dimensions", "CLAUDE_IMAGE_OUTPUT_SVG_INVALID");
  }
  if (width > maxDimension || height > maxDimension || width * height > maxPixels) {
    throw outputImageError("the SVG exceeds the configured pixel dimensions", "CLAUDE_IMAGE_OUTPUT_SVG_DIMENSIONS");
  }
}

function validLimit(value, fallback) {
  return Number.isSafeInteger(value) && value > 0 ? value : fallback;
}

function collectMatches(matches, text, expression, ...groups) {
  for (const match of text.matchAll(expression)) {
    const group = groups.find(index => match[index] !== undefined);
    if (group === undefined) continue;
    matches.push({ index: match.index + match[0].indexOf(match[group]), path: match[group] });
  }
}

function withoutFencedCode(text) {
  return text.replace(/(^|\n)[ \t]*(```|~~~)[^\n]*\n[\s\S]*?(?:\n[ \t]*\2(?=\n|$)|$)/g, match => match.replace(/[^\n]/g, " "));
}

function maskMatches(text, ...expressions) {
  return expressions.reduce(
    (masked, expression) => masked.replace(expression, match => match.replace(/[^\n]/g, " ")),
    text,
  );
}

function normalizeMention(path) {
  return String(path ?? "").trim().replace(/^<|>$/g, "");
}

function isRemoteReference(path) {
  if (/^[a-z]:[\\/]/i.test(path)) return false;
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(path);
}

function deduplicateAttachments(images) {
  const seen = new Set();
  return images.flatMap((attachment) => {
    const id = attachment?.attachmentId;
    if (!id || seen.has(String(id))) return [];
    seen.add(String(id));
    return [attachment];
  });
}

function deduplicateStructuredImages(images) {
  const seen = new Set();
  return images.flatMap((image) => {
    const key = `${image?.mediaType}:${image?.data}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [image];
  });
}

function applyOutputLimits(images, attachments) {
  const maxImages = attachments?.imageLimits?.maxImagesPerMessage;
  const maxBytes = attachments?.imageLimits?.maxMessageImageBytes;
  const accepted = [];
  const failures = [];
  let bytes = 0;
  for (const attachment of images) {
    if (Number.isSafeInteger(maxImages) && accepted.length >= maxImages) {
      failures.push(failure(
        attachment.name ?? String(attachment.attachmentId),
        "CLAUDE_IMAGE_OUTPUT_COUNT_LIMIT",
        "the image count exceeds the configured message limit",
      ));
      continue;
    }
    if (Number.isSafeInteger(maxBytes) && bytes + attachment.bytes > maxBytes) {
      failures.push(failure(
        attachment.name ?? String(attachment.attachmentId),
        "CLAUDE_IMAGE_OUTPUT_MESSAGE_TOO_LARGE",
        "the images exceed the configured message byte limit",
      ));
      continue;
    }
    accepted.push(attachment);
    bytes += attachment.bytes;
  }
  return { images: accepted, failures };
}

function decodeBase64(encoded) {
  const compact = encoded.replace(/\s/g, "");
  if (!compact || !/^[A-Za-z0-9+/]+={0,2}$/.test(compact) || compact.length % 4 !== 0) {
    throw outputImageError("Claude returned invalid Base64 image data", "CLAUDE_IMAGE_OUTPUT_INVALID");
  }
  const data = Buffer.from(compact, "base64");
  if (data.length === 0 || data.toString("base64").replace(/=+$/, "") !== compact.replace(/=+$/, "")) {
    throw outputImageError("Claude returned invalid Base64 image data", "CLAUDE_IMAGE_OUTPUT_INVALID");
  }
  return data;
}

function extensionForMediaType(mediaType) {
  if (mediaType === "image/jpeg") return ".jpg";
  if (typeof mediaType !== "string" || !mediaType.startsWith("image/")) return "";
  return `.${mediaType.slice("image/".length)}`;
}

function failure(path, code, reason) {
  return { path, code, reason };
}

function outputFailureReason(error) {
  if (error?.code === "ENOENT") return "the file does not exist";
  if (error?.code === "EACCES") return "the file cannot be read";
  return error?.message ?? "the image could not be imported";
}

function outputImageError(message, code) {
  return Object.assign(new Error(message), { code });
}
