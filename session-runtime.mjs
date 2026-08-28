import { EventEmitter } from "node:events";

import { ClaudeCliClient } from "./cli-client.mjs";

const DEFAULT_MODELS = [
  {
    id: "sonnet",
    displayName: "Claude Sonnet",
    description: "Claude Code default balanced model",
    isDefault: true,
    defaultReasoningEffort: "medium",
    supportedReasoningEfforts: [{ reasoningEffort: "low" }, { reasoningEffort: "medium" }, { reasoningEffort: "high" }],
  },
  {
    id: "opus",
    displayName: "Claude Opus",
    description: "Claude Code high-capability model",
    isDefault: false,
    defaultReasoningEffort: "high",
    supportedReasoningEfforts: [{ reasoningEffort: "medium" }, { reasoningEffort: "high" }],
  },
  {
    id: "haiku",
    displayName: "Claude Haiku",
    description: "Claude Code fast model",
    isDefault: false,
    defaultReasoningEffort: "low",
    supportedReasoningEfforts: [{ reasoningEffort: "low" }, { reasoningEffort: "medium" }],
  },
];

export class ClaudeSessionRuntime extends EventEmitter {
  constructor({
    client = new ClaudeCliClient(),
    cwd = process.cwd(),
  } = {}) {
    super();
    this.client = client;
    this.cwd = cwd;
    this.sessions = new Map();
    this.models = DEFAULT_MODELS;
    this.selectedSessionId = null;
    this.diagnostics = [];
    this.closed = false;

    this.client.on?.("activity", message => this.handleActivity(message));
    this.client.on?.("request", request => this.emit("request", request));
    this.client.on?.("diagnostic", message => this.addDiagnostic(message));
    this.client.on?.("exit", details => {
      this.addDiagnostic(`Claude backend exited: ${JSON.stringify(details)}`);
      this.emitChange();
    });
  }

  async initialize() {
    await this.client.start?.();
    const models = await this.client.listModels?.().catch((error) => {
      this.addDiagnostic(`Claude model list failed: ${error.message}`);
      return null;
    });
    if (Array.isArray(models) && models.length > 0) this.models = models;
    this.emitChange();
    return this.snapshot();
  }

  async createSession({
    model,
    effort,
    sandbox = "workspace-write",
    approvalPolicy = "on-request",
    cwd = this.cwd,
    ephemeral = false,
    settingSources = ["user", "project", "local"],
    systemPrompt = { type: "preset", preset: "claude_code" },
  } = {}) {
    const selectedModel = model ?? this.models.find(candidate => candidate.isDefault)?.id ?? "sonnet";
    const selectedEffort = effort
      ?? this.models.find(candidate => candidate.id === selectedModel)?.defaultReasoningEffort
      ?? "medium";
    const created = await this.client.createSession?.({
      model: selectedModel,
      effort: selectedEffort,
      sandbox,
      approvalPolicy,
      cwd,
      ephemeral,
      settingSources,
      systemPrompt,
    });
    const session = this.upsertSession(created ?? {}, {
      id: created?.id,
      model: selectedModel,
      effort: selectedEffort,
      sandbox,
      approvalPolicy,
      cwd,
      ephemeral,
    });
    if (!session.ephemeral) this.selectedSessionId = session.id;
    this.emitChange();
    return publicSession(session);
  }

  async resumeSession(sessionId, defaults = {}) {
    if (!sessionId?.trim()) throw new Error("sessionId is required");
    const resumed = await this.client.resumeSession?.(sessionId, {
      cwd: defaults.cwd ?? this.cwd,
      ...defaults,
    });
    const session = this.upsertSession(resumed ?? {}, { id: sessionId, ...defaults });
    if (Array.isArray(resumed?.turns) && resumed.turns.length > 0) session.turns = structuredClone(resumed.turns);
    if (!session.ephemeral) this.selectedSessionId = sessionId;
    this.emitChange();
    return publicSession(session);
  }

  async sendMessage(sessionId, message = {}) {
    const { text, content, model, effort, sandbox, approvalPolicy, cwd } = message;
    const session = this.requireSession(sessionId);
    const hasContent = Array.isArray(content) && content.some(block =>
      block?.type === "image" || (block?.type === "text" && String(block.text ?? "").trim()),
    );
    if (!text?.trim() && !hasContent) throw new Error("message content is required");
    const next = {
      model: model ?? session.model,
      effort: effort ?? session.effort,
      sandbox: sandbox ?? session.sandbox,
      approvalPolicy: approvalPolicy ?? session.approvalPolicy,
      cwd: cwd ?? session.cwd,
    };
    Object.assign(session, next, { updatedAt: nowSeconds() });
    const turn = await this.client.sendMessage(sessionId, { ...message, text, content, ...next });
    this.ensureTurn(session, turn);
    this.emitChange();
    return structuredClone(turn);
  }

  async interruptTurn(sessionId, turnId) {
    await this.client.interruptTurn?.(sessionId, turnId);
  }

  async resolveRequest(requestId, response = {}) {
    if (typeof this.client.resolveRequest !== "function") {
      throw new Error("Claude client does not support interactive request resolution");
    }
    this.client.resolveRequest(requestId, response);
  }

  rejectRequest(requestId, error) {
    this.client.rejectRequest?.(requestId, error);
  }

  async releaseSession(sessionId) {
    if (!sessionId) return;
    await this.client.releaseSession?.(sessionId).catch((error) => {
      this.addDiagnostic(`Claude session release failed for ${sessionId}: ${error.message}`);
    });
    this.sessions.delete(sessionId);
    if (this.selectedSessionId === sessionId) this.selectedSessionId = null;
    this.emitChange();
  }

  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    return session ? publicSession(session) : null;
  }

  snapshot() {
    return {
      connected: !this.closed,
      selectedSessionId: this.selectedSessionId,
      cwd: this.cwd,
      models: structuredClone(this.models),
      sessions: [...this.sessions.values()]
        .sort((left, right) => right.updatedAt - left.updatedAt)
        .map(session => publicSession(session)),
      diagnostics: this.diagnostics.slice(-20),
    };
  }

  async close() {
    if (this.closed) return;
    this.closed = true;
    await this.client.close?.();
  }

  handleActivity(message) {
    const params = message.params ?? {};
    const sessionId = params.sessionId ?? params.session?.id ?? null;
    const session = sessionId ? this.sessions.get(sessionId) : null;
    if (message.method === "turn/completed" && session) {
      const turn = params.turn;
      if (turn?.id) this.ensureTurn(session, turn);
    }
    this.emit("activity", message);
    this.emitChange();
  }

  upsertSession(input = {}, defaults = {}) {
    const id = input.id ?? defaults.id;
    if (!id) throw new Error("Claude session id is required");
    const existing = this.sessions.get(id) ?? { id, turns: [], createdAt: nowSeconds() };
    Object.assign(existing, {
      model: defaults.model ?? input.model ?? existing.model ?? this.models.find(candidate => candidate.isDefault)?.id ?? "sonnet",
      effort: defaults.effort ?? input.effort ?? existing.effort ?? "medium",
      sandbox: defaults.sandbox ?? input.sandbox ?? existing.sandbox ?? "workspace-write",
      approvalPolicy: defaults.approvalPolicy ?? input.approvalPolicy ?? existing.approvalPolicy ?? "on-request",
      cwd: defaults.cwd ?? input.cwd ?? existing.cwd ?? this.cwd,
      ephemeral: Boolean(defaults.ephemeral ?? input.ephemeral ?? existing.ephemeral),
      updatedAt: input.updatedAt ?? nowSeconds(),
    });
    if (Array.isArray(input.turns) && input.turns.length > 0) existing.turns = structuredClone(input.turns);
    this.sessions.set(id, existing);
    return existing;
  }

  requireSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`unknown Claude session ${sessionId}`);
    return session;
  }

  ensureTurn(session, turn) {
    if (!turn?.id) return;
    const existing = session.turns.findIndex(candidate => candidate.id === turn.id);
    if (existing >= 0) {
      if (session.turns[existing].status !== "inProgress" && turn.status === "inProgress") return;
      session.turns[existing] = structuredClone(turn);
    }
    else session.turns.push(structuredClone(turn));
    session.updatedAt = nowSeconds();
  }

  addDiagnostic(message) {
    this.diagnostics.push(String(message));
    this.diagnostics.splice(0, Math.max(0, this.diagnostics.length - 50));
  }

  emitChange() {
    this.emit("change", this.snapshot());
  }
}

function publicSession(session) {
  return structuredClone({
    id: session.id,
    model: session.model,
    effort: session.effort,
    sandbox: session.sandbox,
    approvalPolicy: session.approvalPolicy,
    cwd: session.cwd,
    ephemeral: session.ephemeral,
    turns: session.turns ?? [],
  });
}

function nowSeconds() {
  return Date.now() / 1000;
}
