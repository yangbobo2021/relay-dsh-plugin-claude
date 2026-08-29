import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";
import { z } from "zod";

import { normalizeClaudePlugins } from "./claude-plugin-config.mjs";

const DEFAULT_MODELS = [
  { id: "sonnet", displayName: "Claude Sonnet", isDefault: true, defaultReasoningEffort: "medium", supportedReasoningEfforts: reasoningEfforts(), inputModalities: ["text", "image"] },
  { id: "opus", displayName: "Claude Opus", isDefault: false, defaultReasoningEffort: "high", supportedReasoningEfforts: reasoningEfforts(), inputModalities: ["text", "image"] },
  { id: "haiku", displayName: "Claude Haiku", isDefault: false, defaultReasoningEffort: "low", supportedReasoningEfforts: reasoningEfforts(), inputModalities: ["text", "image"] },
];

function reasoningEfforts() {
  return ["low", "medium", "high"].map(reasoningEffort => ({ reasoningEffort }));
}

export class ClaudeSdkClient extends EventEmitter {
  constructor({ sdk = null, pathToClaudeCodeExecutable = undefined, requestTimeoutMs = 30 * 60_000 } = {}) {
    super();
    this.sdk = sdk;
    this.pathToClaudeCodeExecutable = pathToClaudeCodeExecutable;
    this.requestTimeoutMs = requestTimeoutMs;
    this.sessions = new Map();
    this.queries = new Map();
    this.pendingRequests = new Map();
    this.closed = false;
  }

  async start() {
    this.sdk ??= await import("@anthropic-ai/claude-agent-sdk");
    if (typeof this.sdk.query !== "function") throw new Error("Claude Agent SDK query() is unavailable");
    this.closed = false;
  }

  async listModels() {
    return DEFAULT_MODELS;
  }

  async createSession(config = {}) {
    config = normalizedSessionConfig(config);
    const id = config.sessionId ?? randomUUID();
    this.sessions.set(id, { id, cwd: config.cwd ?? process.cwd(), created: false, config: structuredClone(config) });
    return { id, cwd: config.cwd ?? process.cwd(), turns: [] };
  }

  async resumeSession(sessionId, config = {}) {
    config = normalizedSessionConfig(config);
    const existing = this.sessions.get(sessionId) ?? { id: sessionId, created: true, config: {} };
    this.sessions.set(sessionId, {
      ...existing,
      cwd: config.cwd ?? existing.cwd ?? process.cwd(),
      config: { ...existing.config, ...structuredClone(config) },
    });
    return { id: sessionId, cwd: config.cwd ?? existing.cwd ?? process.cwd(), turns: [] };
  }

  async sendMessage(sessionId, message = {}) {
    if (message.plugins !== undefined) {
      throw new TypeError("Claude plugins must be configured when the Session is created or resumed");
    }
    const session = this.sessions.get(sessionId) ?? (await this.resumeSession(sessionId, message));
    const turnId = randomUUID();
    const abortController = new AbortController();
    const options = this.queryOptions(session, message, abortController);
    const query = this.sdk.query({ prompt: claudePrompt(message), options });
    this.queries.set(turnId, { query, abortController, sessionId });
    void this.consumeQuery(session, turnId, query).catch((error) => {
      this.emit("diagnostic", `Claude SDK query failed: ${error?.stack ?? error}`);
      this.completeTurn(session.id, turnId, "failed", error);
    });
    session.created = true;
    return { id: turnId, status: "inProgress", items: [] };
  }

  async interruptTurn(_sessionId, turnId) {
    const record = this.queries.get(turnId);
    if (!record) return;
    await record.query.interrupt?.().catch(() => {});
    record.abortController.abort();
    record.query.close?.();
  }

  async releaseSession(sessionId) {
    for (const [turnId, record] of this.queries) {
      if (record.sessionId === sessionId) {
        record.abortController.abort();
        record.query.close?.();
        this.queries.delete(turnId);
      }
    }
    this.sessions.delete(sessionId);
  }

  async close() {
    this.closed = true;
    for (const record of this.queries.values()) {
      record.abortController.abort();
      record.query.close?.();
    }
    this.queries.clear();
    for (const request of this.pendingRequests.values()) {
      request.resolve({ behavior: "deny", message: "Relay Claude SDK client closed" });
    }
    this.pendingRequests.clear();
  }

  resolveRequest(requestId, response = {}) {
    const request = this.pendingRequests.get(String(requestId));
    if (!request) throw new Error(`unknown pending Claude request ${requestId}`);
    this.pendingRequests.delete(String(requestId));
    request.resolve(responseForRequest(request, response));
  }

  rejectRequest(requestId, error) {
    const request = this.pendingRequests.get(String(requestId));
    if (!request) return;
    this.pendingRequests.delete(String(requestId));
    request.resolve({ behavior: "deny", message: error?.message ?? String(error) });
  }

  queryOptions(session, message, abortController) {
    const plugins = normalizeClaudePlugins(session.config?.plugins);
    return {
      abortController,
      cwd: message.cwd ?? session.cwd ?? process.cwd(),
      model: message.model ?? session.config?.model,
      effort: message.effort ?? session.config?.effort,
      // Without a summarized display the model streams thinking blocks whose text is empty, so the
      // reasoning projection below receives a signature and a token count and has nothing to show.
      // Effort still decides how much thinking happens; display decides whether it is readable.
      thinking: { type: "adaptive", display: "summarized" },
      permissionMode: sdkPermissionMode(message),
      settingSources: message.settingSources ?? session.config?.settingSources ?? ["user", "project", "local"],
      systemPrompt: message.systemPrompt ?? session.config?.systemPrompt,
      pathToClaudeCodeExecutable: this.pathToClaudeCodeExecutable,
      includePartialMessages: true,
      ...(plugins === undefined ? {} : { plugins }),
      ...(session.created ? { resume: session.id } : { sessionId: session.id }),
      canUseTool: (toolName, input, options) => this.requestPermission(session.id, toolName, input, options),
      ...dshMcpOptions(this.sdk, message.dshTools, message.executeDshTool, abortController.signal),
    };
  }

  requestPermission(sessionId, toolName, input, options = {}) {
    const id = options.requestId ?? randomUUID();
    return new Promise((resolve) => {
      const request = {
        id,
        method: toolName === "AskUserQuestion" ? "tool/requestUserInput" : "tool/requestApproval",
        signal: options.signal,
        params: {
          sessionId,
          toolName,
          input: structuredClone(input ?? {}),
          title: options.title,
          displayName: options.displayName,
          description: options.description,
          decisionReason: options.decisionReason,
          blockedPath: options.blockedPath,
          toolUseID: options.toolUseID,
          suggestions: structuredClone(options.suggestions ?? []),
        },
      };
      this.pendingRequests.set(String(id), { request, resolve, input });
      options.signal?.addEventListener("abort", () => this.rejectRequest(id, new Error("Claude permission request was cancelled")), { once: true });
      this.emit("request", request);
    });
  }

  async consumeQuery(session, turnId, query) {
    const state = {
      currentMessageId: null,
      text: new Map(),
      reasoning: new Map(),
      activities: new Set(),
      tools: new Map(),
    };
    let completed = false;
    try {
      for await (const message of query) {
        for (const event of normalizeSdkMessage(message, state)) {
          this.emit("activity", { method: event.method, params: { sessionId: session.id, turnId, ...event.params } });
        }
        if (message.type === "result") {
          completed = true;
          this.completeTurn(session.id, turnId, message.is_error ? "failed" : "completed", resultError(message));
        }
      }
      if (!completed) this.completeTurn(session.id, turnId, "completed");
    } finally {
      this.queries.delete(turnId);
    }
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

function normalizedSessionConfig(config) {
  const plugins = normalizeClaudePlugins(config.plugins);
  const normalized = {
    ...config,
    ...(plugins === undefined ? {} : { plugins }),
  };
  if (plugins === undefined) delete normalized.plugins;
  return normalized;
}

function claudePrompt(message) {
  const content = Array.isArray(message.content) ? message.content : [];
  if (!content.some(block => block?.type === "image")) return message.text;
  const sdkContent = content.map((block) => {
    if (block?.type === "text") return { type: "text", text: String(block.text ?? "") };
    if (block?.type === "image" && CLAUDE_IMAGE_MEDIA_TYPES.has(block.mediaType) && typeof block.data === "string") {
      return {
        type: "image",
        source: { type: "base64", media_type: block.mediaType, data: block.data },
      };
    }
    throw Object.assign(new Error("Claude SDK received invalid multimodal message content."), {
      code: "CLAUDE_IMAGE_INPUT_INVALID",
    });
  });
  return oneUserMessage(sdkContent);
}

async function* oneUserMessage(content) {
  yield {
    type: "user",
    message: { role: "user", content },
    parent_tool_use_id: null,
  };
}

const CLAUDE_IMAGE_MEDIA_TYPES = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);

function dshMcpOptions(sdk, schemas, execute, signal) {
  if (!Array.isArray(schemas) || schemas.length === 0) return {};
  if (typeof execute !== "function") throw new Error("Claude DSH tools require an execution callback");
  if (typeof sdk.createSdkMcpServer !== "function" || typeof sdk.tool !== "function") {
    throw new Error("This Claude Agent SDK does not support in-process DSH tools");
  }
  const tools = schemas.map(schema => sdk.tool(
    schema.name,
    schema.description,
    jsonSchemaShape(schema.parameters),
    async (args, extra = {}) => dshToolResult(await execute({
      name: schema.name,
      arguments: args,
      callId: extra.toolUseID ?? extra.toolUseId ?? randomUUID(),
      signal: extra.signal ?? signal,
    })),
  ));
  return {
    mcpServers: {
      dsh: sdk.createSdkMcpServer({ name: "dsh", version: "1.0.0", tools, alwaysLoad: true }),
    },
    allowedTools: schemas.map(schema => `mcp__dsh__${schema.name}`),
  };
}

function jsonSchemaShape(schema) {
  if (!schema || schema.type !== "object" || typeof schema.properties !== "object" || schema.properties === null) {
    if (schema?.type === "object" && schema.properties === undefined) return {};
    throw new Error("DSH tool parameters must use an object JSON Schema");
  }
  const required = new Set(Array.isArray(schema.required) ? schema.required : []);
  return Object.fromEntries(Object.entries(schema.properties).map(([name, property]) => {
    let field;
    try {
      field = z.fromJSONSchema(property);
    } catch {
      field = z.unknown();
    }
    return [name, required.has(name) ? field : field.optional()];
  }));
}

function dshToolResult(result) {
  const content = (result.content ?? []).map(block => {
    if (block?.type === "text") return { type: "text", text: String(block.text ?? "") };
    if (block?.type === "image" && typeof block.data === "string" && typeof block.mediaType === "string") {
      return { type: "image", data: block.data, mimeType: block.mediaType };
    }
    return { type: "text", text: JSON.stringify(block) };
  });
  if (content.length === 0) content.push({ type: "text", text: result.isError ? "DSH tool failed" : "DSH tool completed." });
  return { content, isError: Boolean(result.isError) };
}

function normalizeSdkMessage(message, state) {
  const events = [];
  if (message.type === "stream_event") {
    const event = message.event;
    if (event?.type === "message_start") {
      state.currentMessageId = event.message?.id ?? message.uuid ?? null;
      return events;
    }
    if (event?.type === "content_block_delta" && event.delta?.type === "text_delta") {
      const itemId = streamItemId(state, "text", event.index);
      state.text.set(itemId, `${state.text.get(itemId) ?? ""}${event.delta.text}`);
      events.push({ method: "item/agentMessage/delta", params: { itemId, delta: event.delta.text } });
    }
    if (event?.type === "content_block_delta" && event.delta?.type === "thinking_delta") {
      const itemId = streamItemId(state, "reason", event.index);
      state.reasoning.set(itemId, `${state.reasoning.get(itemId) ?? ""}${event.delta.thinking}`);
      events.push({ method: "item/reasoning/summaryTextDelta", params: { itemId, delta: event.delta.thinking } });
    }
    return events;
  }
  if (message.type === "assistant") {
    const content = message.message?.content ?? [];
    for (const [index, block] of content.entries()) {
      if (block.type === "text" && block.text) {
        const itemId = block.id ?? messageItemId(state.text, message, "text", content, index);
        const previous = state.text.get(itemId) ?? "";
        const delta = block.text.startsWith(previous) ? block.text.slice(previous.length) : block.text;
        state.text.set(itemId, block.text);
        if (delta) events.push({ method: "item/agentMessage/delta", params: { itemId, delta } });
      }
      if (block.type === "thinking" && block.thinking) {
        const itemId = block.id ?? messageItemId(state.reasoning, message, "reason", content, index);
        const previous = state.reasoning.get(itemId) ?? "";
        const delta = block.thinking.startsWith(previous) ? block.thinking.slice(previous.length) : block.thinking;
        state.reasoning.set(itemId, block.thinking);
        if (delta) events.push({ method: "item/reasoning/summaryTextDelta", params: { itemId, delta } });
      }
      if (block.type === "tool_use") {
        const item = { type: "toolUse", id: block.id, name: block.name, input: block.input, status: "inProgress" };
        state.tools.set(String(block.id), { name: block.name, input: block.input });
        if (!state.activities.has(item.id)) {
          state.activities.add(item.id);
          events.push({ method: "item/started", params: { item } });
        }
      }
    }
  }
  if (message.type === "user") {
    for (const block of message.message?.content ?? []) {
      if (block.type !== "tool_result") continue;
      const tool = state.tools.get(String(block.tool_use_id)) ?? {};
      const images = structuredImagesFrom(block.content, message.tool_use_result);
      events.push({
        method: "item/completed",
        params: {
          item: {
            type: "toolUse",
            id: block.tool_use_id,
            name: tool.name,
            input: tool.input,
            output: redactStructuredImages(block.content),
            ...(images.length > 0 ? { images } : {}),
            status: block.is_error ? "failed" : "completed",
          },
        },
      });
    }
  }
  if (message.type === "system" && message.subtype === "permission_denied") {
    events.push({
      method: "item/completed",
      params: {
        item: {
          type: "toolUse",
          id: message.tool_use_id,
          name: message.tool_name,
          output: message.message,
          status: "failed",
        },
      },
    });
  }
  return events;
}

function structuredImagesFrom(...values) {
  const images = [];
  const seenObjects = new Set();
  const seenImages = new Set();
  const visit = (value) => {
    if (!value || typeof value !== "object" || seenObjects.has(value)) return;
    seenObjects.add(value);
    if (value.type === "image") {
      const mediaType = value.mediaType ?? value.mimeType ?? value.source?.media_type ?? value.file?.type;
      const data = value.data ?? value.source?.data ?? value.file?.base64;
      if (CLAUDE_IMAGE_MEDIA_TYPES.has(mediaType) && typeof data === "string") {
        const key = `${mediaType}:${data}`;
        if (!seenImages.has(key)) {
          seenImages.add(key);
          images.push({ mediaType, data, name: value.name ?? value.file?.name });
        }
      }
    }
    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }
    for (const item of Object.values(value)) visit(item);
  };
  for (const value of values) visit(value);
  return images;
}

function redactStructuredImages(value) {
  if (Array.isArray(value)) return value.map(redactStructuredImages);
  if (!value || typeof value !== "object") return value;
  if (value.type === "image") {
    return {
      type: "image",
      mediaType: value.mediaType ?? value.mimeType ?? value.source?.media_type ?? value.file?.type ?? "unknown",
      omitted: true,
    };
  }
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redactStructuredImages(item)]));
}

function streamItemId(state, type, index) {
  return `${state.currentMessageId ?? "message"}-${type}-${index ?? 0}`;
}

function messageItemId(items, message, type, content, index) {
  const prefix = `${message.message?.id ?? message.uuid ?? "message"}-${type}-`;
  const ordinal = content.slice(0, index).filter(block => block.type === (type === "reason" ? "thinking" : type)).length;
  const existing = [...items.keys()]
    .filter(itemId => itemId.startsWith(prefix))
    .sort((left, right) => Number(left.slice(prefix.length)) - Number(right.slice(prefix.length)));
  return existing[ordinal] ?? `${prefix}${index}`;
}

function responseForRequest(pending, response) {
  if (response.action === "accept" || response.action === "allow") {
    return { behavior: "allow", updatedInput: response.updatedInput ?? pending.input };
  }
  if (response.action === "answer") {
    return { behavior: "allow", updatedInput: { ...pending.input, answers: response.answers ?? {} } };
  }
  return { behavior: "deny", message: response.message ?? "User declined this Claude tool request" };
}

function resultError(message) {
  if (!message?.is_error) return null;
  return new Error(message.errors?.join("\n") || message.subtype || "Claude SDK turn failed");
}

function sdkPermissionMode(message) {
  if (message.permissionMode) return message.permissionMode;
  if (message.approvalPolicy === "never") return "dontAsk";
  if (message.sandbox === "read-only") return "plan";
  return "default";
}
