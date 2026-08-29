import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";
import readline from "node:readline";

const DEFAULT_MODELS = [
  { id: "sonnet", displayName: "Claude Sonnet", isDefault: true, defaultReasoningEffort: "medium", inputModalities: ["text"] },
  { id: "opus", displayName: "Claude Opus", isDefault: false, defaultReasoningEffort: "high", inputModalities: ["text"] },
  { id: "haiku", displayName: "Claude Haiku", isDefault: false, defaultReasoningEffort: "low", inputModalities: ["text"] },
];

export class ClaudeCliClient extends EventEmitter {
  constructor({ command = "claude", args = [], requestTimeoutMs = 30 * 60_000 } = {}) {
    super();
    this.command = command;
    this.args = args;
    this.requestTimeoutMs = requestTimeoutMs;
    this.sessions = new Map();
    this.processes = new Map();
    this.closed = false;
  }

  async start() {
    this.closed = false;
  }

  async listModels() {
    return DEFAULT_MODELS;
  }

  async createSession(config = {}) {
    assertSdkOnlyPluginsAbsent(config);
    const id = config.sessionId ?? randomUUID();
    const session = { id, cwd: config.cwd ?? process.cwd(), created: false, config: structuredClone(config) };
    this.sessions.set(id, session);
    return { id, cwd: session.cwd, turns: [] };
  }

  async resumeSession(sessionId, config = {}) {
    assertSdkOnlyPluginsAbsent(config);
    const existing = this.sessions.get(sessionId) ?? { id: sessionId, created: true };
    const session = { ...existing, cwd: config.cwd ?? existing.cwd ?? process.cwd(), config: { ...existing.config, ...config } };
    this.sessions.set(sessionId, session);
    return { id: sessionId, cwd: session.cwd, turns: [] };
  }

  async sendMessage(sessionId, message = {}) {
    assertSdkOnlyPluginsAbsent(message);
    if (message.content?.some(block => block?.type === "image")) {
      throw new Error("The Claude CLI backend cannot accept image input; use the Claude Agent SDK backend");
    }
    if (Array.isArray(message.dshTools) && message.dshTools.length > 0) {
      throw new Error("The Claude CLI backend cannot expose DSH tools; use the Claude Agent SDK backend");
    }
    const session = this.sessions.get(sessionId) ?? (await this.resumeSession(sessionId, message));
    const turnId = randomUUID();
    const child = this.spawnTurn(session, turnId, message);
    this.processes.set(turnId, child);
    return { id: turnId, status: "inProgress", items: [] };
  }

  async interruptTurn(_sessionId, turnId) {
    const child = this.processes.get(turnId);
    if (!child) return;
    child.kill("SIGTERM");
  }

  async releaseSession(sessionId) {
    for (const [turnId, child] of this.processes) {
      if (child.relayClaudeSessionId === sessionId) {
        child.kill("SIGTERM");
        this.processes.delete(turnId);
      }
    }
    this.sessions.delete(sessionId);
  }

  async close() {
    this.closed = true;
    for (const child of this.processes.values()) child.kill("SIGTERM");
    this.processes.clear();
  }

  spawnTurn(session, turnId, message) {
    const settingSourceArgs = settingSourceArguments(message.settingSources ?? session.config?.settingSources);
    const systemPromptArgs = systemPromptArguments(message.systemPrompt ?? session.config?.systemPrompt);
    const cliArgs = [
      ...this.args,
      "-p",
      message.text,
      "--output-format",
      "stream-json",
      "--verbose",
      "--include-partial-messages",
      "--model",
      message.model ?? session.config?.model ?? "sonnet",
      "--effort",
      message.effort ?? session.config?.effort ?? "medium",
      "--permission-mode",
      permissionMode(message),
      ...settingSourceArgs,
      ...systemPromptArgs,
      ...(session.created ? ["--resume", session.id] : ["--session-id", session.id]),
    ];
    const child = spawn(this.command, cliArgs, {
      cwd: message.cwd ?? session.cwd ?? process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env },
    });
    child.relayClaudeSessionId = session.id;
    session.created = true;
    const state = { textItemId: null, text: "", activities: new Set() };
    const output = readline.createInterface({ input: child.stdout });
    output.on("line", (line) => this.handleLine(session.id, turnId, line, state));
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", chunk => this.emit("diagnostic", String(chunk)));
    child.once("error", error => {
      this.emit("diagnostic", `Claude CLI failed: ${error.message}`);
      this.completeTurn(session.id, turnId, "failed", error);
    });
    child.once("exit", (code, signal) => {
      this.processes.delete(turnId);
      if (signal || code) this.completeTurn(session.id, turnId, "failed", new Error(`claude exited (${signal ?? code})`));
      else this.completeTurn(session.id, turnId, "completed");
    });
    return child;
  }

  handleLine(sessionId, turnId, line, state) {
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      this.emitText(sessionId, turnId, state, line);
      return;
    }
    for (const event of normalizeClaudeStreamMessage(message, state)) {
      this.emit("activity", { method: event.method, params: { sessionId, turnId, ...event.params } });
    }
  }

  emitText(sessionId, turnId, state, text) {
    if (!text) return;
    state.textItemId ??= `answer-${turnId}`;
    this.emit("activity", {
      method: "item/agentMessage/delta",
      params: { sessionId, turnId, itemId: state.textItemId, delta: `${text}\n` },
    });
  }

  completeTurn(sessionId, turnId, status, error = null) {
    this.emit("activity", {
      method: "turn/completed",
      params: {
        sessionId,
        turn: {
          id: turnId,
          status,
          error: error ? { message: error.message } : null,
          items: [],
        },
      },
    });
  }
}

function assertSdkOnlyPluginsAbsent(config) {
  if (Array.isArray(config.plugins) && config.plugins.length === 0) return;
  if (config.plugins !== undefined) {
    throw Object.assign(new Error("Local Claude plugins require the Claude Agent SDK backend"), {
      code: "CLAUDE_LOCAL_PLUGINS_REQUIRE_SDK",
    });
  }
}

function normalizeClaudeStreamMessage(message, state) {
  const events = [];
  const content = message.message?.content ?? message.content ?? [];
  for (const block of Array.isArray(content) ? content : []) {
    if (block.type === "text" && block.text) {
      state.textItemId ??= block.id ?? `answer-${message.message?.id ?? "latest"}`;
      const delta = block.text.startsWith(state.text) ? block.text.slice(state.text.length) : block.text;
      state.text = block.text;
      if (delta) events.push({ method: "item/agentMessage/delta", params: { itemId: state.textItemId, delta } });
    }
    if ((block.type === "text_delta" || block.type === "content_block_delta") && (block.text ?? block.delta?.text)) {
      state.textItemId ??= block.id ?? `answer-${message.message?.id ?? "latest"}`;
      const delta = block.text ?? block.delta.text;
      state.text += delta;
      events.push({ method: "item/agentMessage/delta", params: { itemId: state.textItemId, delta } });
    }
    if (block.type === "thinking" && block.thinking) {
      events.push({ method: "item/reasoning/summaryTextDelta", params: { itemId: block.id ?? "reasoning", delta: block.thinking } });
    }
    if (block.type === "tool_use") {
      const item = {
        type: "toolUse",
        id: block.id ?? block.name,
        name: block.name,
        input: block.input,
        status: "inProgress",
      };
      if (!state.activities.has(item.id)) {
        state.activities.add(item.id);
        events.push({ method: "item/started", params: { item } });
      }
    }
    if (block.type === "tool_result") {
      events.push({
        method: "item/completed",
        params: {
          item: {
            type: "toolUse",
            id: block.tool_use_id ?? block.id,
            name: block.name,
            output: block.content,
            status: block.is_error ? "failed" : "completed",
          },
        },
      });
    }
  }
  if (message.type === "result" && message.result) {
    state.textItemId ??= `answer-${message.session_id ?? "latest"}`;
    const delta = String(message.result).startsWith(state.text)
      ? String(message.result).slice(state.text.length)
      : String(message.result);
    state.text = String(message.result);
    if (delta) events.push({ method: "item/agentMessage/delta", params: { itemId: state.textItemId, delta } });
  }
  return events;
}

function permissionMode(message) {
  if (message.permissionMode) return message.permissionMode;
  if (message.approvalPolicy === "never") return "plan";
  if (message.sandbox === "read-only") return "plan";
  return "manual";
}

function settingSourceArguments(value) {
  if (Array.isArray(value) && value.length === 0) return ["--safe-mode"];
  if (Array.isArray(value)) return ["--setting-sources", value.join(",")];
  if (typeof value === "string" && value.trim()) return ["--setting-sources", value];
  return ["--setting-sources", "user,project,local"];
}

function systemPromptArguments(value) {
  if (typeof value === "string" && value.trim()) return ["--system-prompt", value];
  return [];
}
