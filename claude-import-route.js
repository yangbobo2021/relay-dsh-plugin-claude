import { timingSafeEqual } from "node:crypto";
import { CLAUDE_IMPORT_PATH } from "./claude-import-contract.mjs";

export { CLAUDE_IMPORT_PATH } from "./claude-import-contract.mjs";

export function registerClaudeImportRoute(ctx, options) {
  return ctx.webServer.register({
    kind: "exact",
    path: CLAUDE_IMPORT_PATH,
    handler: createClaudeImportHandler({
      workspaceRegistry: ctx.workspaceRegistry,
      token: process.env.RELAY_CLAUDE_IMPORT_TOKEN,
      ...options,
    }),
  });
}

export function createClaudeImportHandler({
  importer,
  workspaceRegistry,
  token,
  maxBodyBytes = 16_384,
}) {
  if (!importer || !workspaceRegistry) throw new Error("Claude import route requires importer and Workspace registry");
  return async (request, response) => {
    if (request.method !== "POST") {
      writeJson(response, 405, { error: "method_not_allowed" }, { allow: "POST" });
      return;
    }
    if (!authorized(request, token)) {
      writeJson(response, 403, { error: "forbidden" });
      return;
    }

    try {
      const body = await readJson(request, maxBodyBytes);
      const action = body?.action;
      const cwd = requiredString(body?.cwd, "cwd");
      if (action !== "scan" && action !== "import") {
        throw new ImportRouteError(400, "action must be scan or import");
      }
      const workspace = await workspaceRegistry.resolveByPath(cwd);
      if (!workspace) throw new ImportRouteError(404, "Workspace is not registered in DSH");

      if (action === "scan") {
        const inventory = await importer.scanWorkspace(workspace.path);
        writeJson(response, 200, {
          workspace: { title: workspace.title, path: workspace.path },
          summary: inventory.summary,
          candidates: publicCandidates(inventory.entries),
        });
        return;
      }

      const sessionIds = optionalSessionIds(body?.sessionIds);

      response.writeHead(200, {
        "content-type": "application/x-ndjson; charset=utf-8",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
      });
      try {
        const result = await importer.importWorkspace(workspace.path, {
          sessionIds,
          onProgress: progress => writeLine(response, { type: "progress", ...progress }),
        });
        writeLine(response, { type: "complete", result });
      } catch (error) {
        writeLine(response, {
          type: "error",
          error: "import_failed",
          message: error?.message ?? String(error),
        });
      }
      response.end();
    } catch (error) {
      const status = error instanceof ImportRouteError ? error.statusCode : 500;
      writeJson(response, status, {
        error: status === 413
          ? "payload_too_large"
          : status === 404
            ? "workspace_not_found"
            : status < 500 ? "invalid_request" : "import_failed",
        message: error?.message ?? String(error),
      });
    }
  };
}

export async function readJson(request, maxBodyBytes) {
  const contentType = String(request.headers?.["content-type"] ?? "").split(";", 1)[0].trim();
  if (contentType !== "application/json") {
    throw new ImportRouteError(400, "content-type must be application/json");
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > maxBodyBytes) throw new ImportRouteError(413, `request exceeds ${maxBodyBytes} bytes`);
    chunks.push(buffer);
  }
  if (size === 0) throw new ImportRouteError(400, "request body is empty");
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ImportRouteError(400, "request body is not valid JSON");
  }
}

export function authorized(request, token) {
  if (isLoopback(request.socket?.remoteAddress)) return true;
  if (!token) return false;
  const authorization = String(request.headers?.authorization ?? "");
  if (!authorization.startsWith("Bearer ")) return false;
  const supplied = Buffer.from(authorization.slice(7));
  const expected = Buffer.from(String(token));
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

function isLoopback(address) {
  return address === "127.0.0.1" || address === "::1" || address === "::ffff:127.0.0.1";
}

export function requiredString(value, name) {
  if (typeof value !== "string" || !value.trim()) throw new ImportRouteError(400, `${name} is required`);
  return value.trim();
}

export function optionalSessionIds(value) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length === 0 || value.length > 100) {
    throw new ImportRouteError(400, "sessionIds must contain between 1 and 100 IDs");
  }
  const ids = value.map((sessionId) => requiredString(sessionId, "sessionId"));
  if (new Set(ids).size !== ids.length) throw new ImportRouteError(400, "sessionIds must be unique");
  return ids;
}

function publicCandidates(entries = []) {
  return entries
    .filter(entry => entry.status === "ready" || entry.status === "recoverable")
    .map(({ session, status }) => ({
      id: session.sessionId,
      title: publicSessionTitle(session),
      cwd: session.cwd,
      updatedAt: session.lastModified ?? session.createdAt ?? null,
      status,
    }));
}

function publicSessionTitle(session) {
  for (const value of [session.customTitle, session.summary, session.firstPrompt]) {
    if (typeof value !== "string") continue;
    const normalized = value.replace(/\s+/g, " ").trim();
    if (normalized) return normalized.slice(0, 160);
  }
  return String(session.sessionId);
}

function writeLine(response, value) {
  response.write(`${JSON.stringify(value)}\n`);
}

export function writeJson(response, status, value, headers = {}) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    ...headers,
  });
  response.end(`${JSON.stringify(value)}\n`);
}

export class ImportRouteError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}
