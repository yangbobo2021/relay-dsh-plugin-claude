import { basename, extname, isAbsolute, relative, resolve, sep } from "node:path";
import { open, realpath, stat } from "node:fs/promises";

const MEDIA_TYPES = new Map([
  [".gif", "image/gif"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
]);

const IMAGE_SUFFIX = String.raw`\.(?:png|jpe?g|webp|gif|bmp|svg|tiff?|avif|heic)`;

export function extractFinalAnswerImagePaths(text) {
  const visible = withoutFencedCode(String(text ?? ""));
  const matches = [];
  collectMatches(matches, visible, new RegExp(String.raw`!?\[[^\]\r\n]*\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+["'][^"']*["'])?\s*\)`, "gi"), 1, 2);
  collectMatches(matches, visible, new RegExp("`([^`\\r\\n]+" + IMAGE_SUFFIX + ")`", "gi"), 1);
  collectMatches(matches, visible, new RegExp("[\"']([^\"'\\r\\n]+" + IMAGE_SUFFIX + ")[\"']", "gi"), 1);
  collectMatches(
    matches,
    visible,
    new RegExp("(?:^|[\\s(\\[])((?:\\.{0,2}/|/)[^\\s<>\"'`]+?" + IMAGE_SUFFIX + ")(?=$|[\\s)\\],.;:!?])", "gi"),
    1,
  );
  matches.sort((left, right) => left.index - right.index);
  const seen = new Set();
  return matches.flatMap(({ path }) => {
    const normalized = normalizeMention(path);
    if (!normalized || isRemoteReference(normalized) || seen.has(normalized)) return [];
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
      images.push(await snapshotWorkspaceImage(path, cwd, attachments, signal));
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

async function snapshotWorkspaceImage(path, cwd, attachments, signal) {
  const root = await realpath(resolve(cwd ?? process.cwd()));
  const target = await realpath(resolve(root, path));
  const targetRelative = relative(root, target);
  if (targetRelative === ".." || targetRelative.startsWith(`..${sep}`) || isAbsolute(targetRelative)) {
    throw outputImageError("the path is outside the session workspace", "CLAUDE_IMAGE_OUTPUT_OUTSIDE_WORKSPACE");
  }
  const mediaType = MEDIA_TYPES.get(extname(target).toLowerCase());
  if (!mediaType) {
    throw outputImageError("the image type is unsupported", "CLAUDE_IMAGE_OUTPUT_TYPE_UNSUPPORTED");
  }
  const handle = await open(target, "r");
  let data;
  try {
    const before = await handle.stat();
    if (!before.isFile()) throw outputImageError("the path is not a file", "CLAUDE_IMAGE_OUTPUT_NOT_FILE");
    const maxBytes = attachments.imageLimits?.maxImageBytes;
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
  return attachments.saveImage({ data, mediaType, name: basename(target) });
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

function normalizeMention(path) {
  return String(path ?? "").trim().replace(/^<|>$/g, "");
}

function isRemoteReference(path) {
  return /^(?:https?:|data:|file:)/i.test(path);
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
