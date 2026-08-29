import { createHash } from "node:crypto";
import { realpath } from "node:fs/promises";
import { resolve } from "node:path";

const IMPORT_STATE_ORDER = Object.freeze([
  "reserved", "session-created", "hydrated", "attached", "committed",
]);

export class ClaudeWorkspaceImporter {
  constructor({ runtime, adapter, target, logger = console }) {
    if (!runtime?.listWorkspaceSessions) throw new Error("Claude import requires Workspace Session inventory");
    if (!adapter?.bindImportedSession) throw new Error("Claude import requires a DSH binding adapter");
    if (!["prepare", "hydrate", "attach", "finalize"].every(method => typeof target?.[method] === "function")) {
      throw new Error("Claude import requires a complete DSH Session target");
    }
    this.runtime = runtime;
    this.adapter = adapter;
    this.target = target;
    this.logger = logger;
    this.pendingSessions = new Map();
  }

  async scanWorkspace(cwd) {
    const canonicalCwd = await canonicalPath(cwd);
    const discovered = await this.runtime.listWorkspaceSessions({ cwd: canonicalCwd });
    const sessions = [];
    for (const session of discovered) {
      if (!session || typeof session.sessionId !== "string" || typeof session.cwd !== "string" || !session.cwd.trim()) continue;
      const sessionCwd = await canonicalPath(session.cwd);
      if (sessionCwd !== canonicalCwd) continue;
      sessions.push({ ...session, cwd: sessionCwd });
    }
    sessions.sort(compareInventorySessions);
    const entries = sessions.map((session) => {
      const binding = this.adapter.bindingForClaudeSession(session.sessionId);
      if (!binding) return { session, binding: null, status: "ready" };
      if (binding.bindingMode === "imported" && binding.importState !== "committed") {
        return { session, binding, status: "recoverable" };
      }
      return { session, binding, status: "existing" };
    });
    const existing = entries.filter(entry => entry.status === "existing").length;
    const recoverable = entries.filter(entry => entry.status === "recoverable").length;
    return {
      cwd: canonicalCwd,
      entries,
      summary: {
        found: entries.length,
        existing,
        recoverable,
        ready: entries.length - existing,
      },
    };
  }

  async importWorkspace(cwd, { sessionIds, onProgress } = {}) {
    const inventory = await this.scanWorkspace(cwd);
    const entries = selectedImportEntries(inventory.entries, sessionIds);
    const result = {
      found: sessionIds === undefined ? inventory.summary.found : entries.length,
      imported: 0,
      existing: 0,
      failed: 0,
      failures: [],
    };
    let completed = 0;

    for (const entry of entries) {
      if (entry.status === "existing") {
        result.existing += 1;
      } else {
        try {
          await this.importSession(entry.session, cwd, entry.binding);
          result.imported += 1;
        } catch (error) {
          result.failed += 1;
          const session = shortSessionId(entry.session.sessionId);
          const message = publicErrorMessage(error, entry.session.sessionId, session);
          result.failures.push({ session, message });
          this.logger.warn?.(`Claude import failed for ${session}: ${message}`);
        }
      }
      completed += 1;
      onProgress?.({ completed, total: entries.length, ...result });
    }

    return result;
  }

  async importSession(session, workspaceCwd, existingBinding = null) {
    const pending = this.pendingSessions.get(session.sessionId);
    if (pending) return pending;
    const operation = this.runImportSession(session, workspaceCwd, existingBinding)
      .finally(() => { this.pendingSessions.delete(session.sessionId); });
    this.pendingSessions.set(session.sessionId, operation);
    return operation;
  }

  async runImportSession(session, workspaceCwd, existingBinding = null) {
    const source = await this.runtime.readSession(session.sessionId, { cwd: workspaceCwd });
    if (!source || source.sessionId !== session.sessionId) {
      throw new Error(`Claude Session ${shortSessionId(session.sessionId)} is no longer available in this Workspace`);
    }
    if (await canonicalPath(source.cwd) !== await canonicalPath(workspaceCwd)) {
      throw new Error(`Claude Session ${shortSessionId(session.sessionId)} no longer belongs to this Workspace`);
    }
    let binding = existingBinding;
    if (!binding) {
      const sessionId = importedDshSessionId(session.sessionId);
      binding = this.adapter.bindImportedSession(sessionId, session.sessionId, {
        ...this.adapter.configuration(sessionId, session.cwd),
        cwd: session.cwd,
      });
    }
    if (binding.bindingMode !== "imported") return binding.sessionId;
    if (binding.importState === "committed") return binding.sessionId;

    let transaction = null;
    try {
      transaction = await this.target.prepare({ session, source, binding, workspaceCwd });
      binding = this.adapter.markImportState(binding.sessionId, "session-created");
      if (before(binding.importState, "hydrated")) {
        await this.target.hydrate(transaction);
        binding = this.adapter.markImportState(binding.sessionId, "hydrated");
      }
      if (before(binding.importState, "attached")) {
        await this.target.attach(transaction);
        binding = this.adapter.markImportState(binding.sessionId, "attached");
      }
      if (before(binding.importState, "committed")) {
        await this.target.finalize(transaction);
        binding = this.adapter.markImportState(binding.sessionId, "committed");
      }
      return binding.sessionId;
    } finally {
      if (transaction !== null) await this.target.release?.(transaction);
    }
  }
}

export function importedDshSessionId(sessionId) {
  const digest = createHash("sha256").update(String(sessionId)).digest("hex").slice(0, 24);
  return `claude-import-${digest}`;
}

function before(current, target) {
  return IMPORT_STATE_ORDER.indexOf(current) < IMPORT_STATE_ORDER.indexOf(target);
}

function compareInventorySessions(left, right) {
  const updated = timestampValue(right.lastModified) - timestampValue(left.lastModified);
  return updated === 0 ? String(left.sessionId).localeCompare(String(right.sessionId)) : updated;
}

function timestampValue(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Date.parse(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function selectedImportEntries(entries, sessionIds) {
  if (sessionIds === undefined) return entries;
  if (!Array.isArray(sessionIds) || sessionIds.length === 0) {
    throw new Error("At least one Claude Session must be selected");
  }
  const selected = new Set();
  for (const rawId of sessionIds) {
    if (typeof rawId !== "string") throw new Error("Selected Claude Session IDs must be non-empty strings");
    const sessionId = rawId.trim();
    if (!sessionId) throw new Error("Selected Claude Session IDs must be non-empty strings");
    if (selected.has(sessionId)) throw new Error(`Claude Session ${shortSessionId(sessionId)} was selected more than once`);
    selected.add(sessionId);
  }
  const inventory = new Map(entries.map(entry => [entry.session.sessionId, entry]));
  for (const sessionId of selected) {
    const entry = inventory.get(sessionId);
    if (!entry) throw new Error(`Claude Session ${shortSessionId(sessionId)} is not available in this Workspace`);
    if (entry.status === "existing") throw new Error(`Claude Session ${shortSessionId(sessionId)} is already bound to DSH`);
  }
  return entries.filter(entry => selected.has(entry.session.sessionId));
}

async function canonicalPath(path) {
  const absolute = resolve(path);
  try {
    return await realpath(absolute);
  } catch {
    return absolute;
  }
}

function shortSessionId(sessionId) {
  const value = String(sessionId);
  return value.length > 12 ? `${value.slice(0, 8)}...${value.slice(-4)}` : value;
}

function publicErrorMessage(error, sessionId, shortId) {
  const message = error?.message ?? String(error);
  return String(message).replaceAll(String(sessionId), shortId);
}
