import { LlmAdapter } from "@deepseek-ai/dsh-llm";
import { sessionEvents } from "./dsh-compat.mjs";
import {
  materializeDshToolImages,
  promoteFinalAnswerImages,
} from "./claude-image-output.js";

export const CLAUDE_PRESET = "relay-claude";
export const CLAUDE_PROVIDER = "relay-claude";
export const CLAUDE_ACTIVITY_EVENT = "relay-claude/activity";
const IMPORT_STATES = Object.freeze(["reserved", "session-created", "hydrated", "attached", "committed"]);

export class ClaudeDshAdapter extends LlmAdapter {
  constructor({ runtime, ready, linkStore = null, attachments = null, logger = console }) {
    super();
    this.runtime = runtime;
    this.ready = ready;
    this.logger = logger;
    this.linkStore = linkStore;
    this.attachments = attachments;
    this.links = new Map();
    this.settings = new Map();
    this.bindingModes = new Map();
    this.importStates = new Map();
    this.pendingSessions = new Map();
    this.agents = new Map();
    for (const [sessionId, record] of linkStore?.entries() ?? []) {
      const claudeSessionId = record.claudeSessionId ?? record.sessionId ?? record.threadId;
      if (claudeSessionId) this.links.set(sessionId, claudeSessionId);
      this.settings.set(sessionId, record.config);
      this.bindingModes.set(sessionId, record.bindingMode === "imported" ? "imported" : "native");
      if (record.bindingMode === "imported" && IMPORT_STATES.includes(record.importState)) {
        this.importStates.set(sessionId, record.importState);
      }
    }
  }

  providerInfo() {
    return { id: CLAUDE_PROVIDER, name: "Claude Code" };
  }

  async listModels() {
    await this.ready;
    return runtimeModels(this.runtime)
      .sort((left, right) => Number(Boolean(right.isDefault)) - Number(Boolean(left.isDefault)))
      .map(model => ({
        provider: CLAUDE_PROVIDER,
        id: model.id,
        name: model.displayName ?? model.id,
        description: model.description,
        inputModalities: model.inputModalities ?? ["text"],
      }));
  }

  async resolveModel(provider, model) {
    await this.ready;
    const info = runtimeModels(this.runtime).find(candidate => candidate.id === model);
    return {
      provider,
      id: model,
      name: info?.displayName ?? model,
      inputModalities: info?.inputModalities ?? ["text"],
      ...(Array.isArray(info?.supportedReasoningEfforts)
        ? {
            reasoning: {
              efforts: info.supportedReasoningEfforts.map(effort => ({
                id: effort.reasoningEffort ?? effort.id ?? effort,
                name: reasoningEffortName(effort.reasoningEffort ?? effort.id ?? effort),
              })),
              defaultEffort: info.defaultReasoningEffort,
            },
          }
        : {}),
    };
  }

  attachAgent(agent, requestedPreset = effectivePreset(agent.session)) {
    this.agents.set(String(agent.id), agent);
    if (requestedPreset !== CLAUDE_PRESET) return false;
    this.configuration(agent.id, agent.session.header.cwd);
    return true;
  }

  servesAgent(agent) {
    return effectivePreset(agent.session) === CLAUDE_PRESET;
  }

  detachAgent(sessionId) {
    this.agents.delete(String(sessionId));
  }

  configuration(sessionId, cwd) {
    const key = String(sessionId);
    const existing = this.settings.get(key);
    if (existing) return existing;
    const models = runtimeModels(this.runtime);
    const model = models.find(candidate => candidate.isDefault) ?? models[0];
    const config = {
      model: model?.id ?? "sonnet",
      effort: model?.defaultReasoningEffort ?? "medium",
      sandbox: "workspace-write",
      approvalPolicy: "on-request",
      cwd: cwd ?? process.cwd(),
      settingSources: ["user", "project", "local"],
      systemPrompt: { type: "preset", preset: "claude_code" },
    };
    this.settings.set(key, config);
    return config;
  }

  configure(sessionId, patch = {}) {
    const key = String(sessionId);
    const next = { ...this.configuration(key), ...compact(patch) };
    this.settings.set(key, next);
    const claudeSessionId = this.links.get(key);
    if (claudeSessionId) {
      patchRuntimeSession(this.runtime, claudeSessionId, next);
    }
    this.persistLink(key);
    return structuredClone(next);
  }

  async ensureSession(sessionId) {
    const key = String(sessionId);
    const pending = this.pendingSessions.get(key);
    if (pending) return pending;
    const operation = this.createOrResumeSession(key).finally(() => {
      this.pendingSessions.delete(key);
    });
    this.pendingSessions.set(key, operation);
    return operation;
  }

  async createOrResumeSession(sessionId) {
    await this.ready;
    const settings = { ...this.configuration(sessionId) };
    const linked = this.links.get(sessionId);
    if (linked && hasRuntimeSession(this.runtime, linked)) return linked;
    if (linked) {
      try {
        await this.runtime.resumeSession(linked, settings);
        return linked;
      } catch (error) {
        if (this.bindingModes.get(sessionId) === "imported") {
          throw Object.assign(
            new Error(`Relay could not resume imported Claude Session ${linked}`, { cause: error }),
            { code: "CLAUDE_IMPORTED_SESSION_RESUME_FAILED", claudeSessionId: linked },
          );
        }
        this.logger.warn(`Relay could not resume Claude session ${linked}; creating a replacement: ${error.message}`);
        this.links.delete(sessionId);
      }
    }
    const created = await this.runtime.createSession(settings);
    this.links.set(sessionId, created.id);
    this.bindingModes.set(sessionId, "native");
    this.persistLink(sessionId);
    return created.id;
  }

  persistLink(sessionId) {
    this.linkStore?.set(sessionId, {
      claudeSessionId: this.links.get(sessionId) ?? null,
      config: this.configuration(sessionId),
      bindingMode: this.bindingModes.get(sessionId) ?? "native",
      ...(this.importStates.has(sessionId) ? { importState: this.importStates.get(sessionId) } : {}),
    });
  }

  sessionFor(sessionId) {
    return this.links.get(String(sessionId)) ?? null;
  }

  dshSessionForClaudeSession(claudeSessionId) {
    for (const [sessionId, candidate] of this.links) {
      if (candidate === claudeSessionId) return sessionId;
    }
    return null;
  }

  bindingForClaudeSession(claudeSessionId) {
    const sessionId = this.dshSessionForClaudeSession(claudeSessionId);
    if (!sessionId) return null;
    return {
      sessionId,
      claudeSessionId,
      config: structuredClone(this.configuration(sessionId)),
      bindingMode: this.bindingModes.get(sessionId) ?? "native",
      importState: this.importStates.get(sessionId) ?? null,
    };
  }

  bindImportedSession(sessionId, claudeSessionId, config = {}) {
    const key = String(sessionId).trim();
    const source = String(claudeSessionId).trim();
    if (!key) throw new Error("DSH sessionId is required for an imported Claude binding");
    if (!source) throw new Error("Claude sessionId is required for an imported binding");
    const owner = this.dshSessionForClaudeSession(source);
    if (owner && owner !== key) throw new Error(`Claude Session ${source} is already bound to DSH session ${owner}`);
    const current = this.links.get(key);
    if (current && current !== source) throw new Error(`DSH session ${key} is already bound to Claude Session ${current}`);
    this.links.set(key, source);
    this.settings.set(key, { ...this.configuration(key, config.cwd), ...compact(config) });
    this.bindingModes.set(key, "imported");
    if (!this.importStates.has(key)) this.importStates.set(key, "reserved");
    this.persistLink(key);
    return this.bindingForClaudeSession(source);
  }

  markImportState(sessionId, state) {
    const key = String(sessionId);
    if (this.bindingModes.get(key) !== "imported") throw new Error(`DSH session ${key} is not an imported Claude binding`);
    const next = IMPORT_STATES.indexOf(state);
    if (next === -1) throw new Error(`unknown Claude import state ${state}`);
    const current = IMPORT_STATES.indexOf(this.importStates.get(key) ?? "reserved");
    if (next > current) {
      this.importStates.set(key, state);
      this.persistLink(key);
    }
    return this.bindingForClaudeSession(this.links.get(key));
  }

  async *stream(options) {
    if (options.purpose) {
      yield* this.streamAuxiliary(options);
      return;
    }
    const sessionId = String(options.sessionId ?? "");
    if (!sessionId) throw new Error("Relay Claude adapter requires a DSH session id");
    const candidate = latestUserContent(options.messages, this.attachments, options.signal);
    const content = Array.isArray(candidate) ? candidate : await candidate;
    if (content.length === 0) throw new Error("Relay Claude adapter received no user content");
    const text = content.filter(block => block.type === "text").map(block => block.text).join("\n").trim();
    const agent = this.agents.get(sessionId);
    if (!agent) throw new Error(`Relay Claude adapter has no attached agent for ${sessionId}`);
    const nativePermissions = permissionConfiguration(sessionEvents(agent.session));
    const config = this.configure(sessionId, {
      ...(options.provider === CLAUDE_PROVIDER ? { model: options.model } : {}),
      ...(options.provider === CLAUDE_PROVIDER ? { effort: options.reasoningEffort } : {}),
      ...nativePermissions,
      cwd: agent.session.header.cwd,
    });
    const dshTools = structuredClone(options.tools ?? []);
    const availableTools = new Set(dshTools.map(tool => tool.name));
    const structuredImages = [];
    const structuredCallIds = new Set();
    const executeDshTool = async ({ name, arguments: args, callId, signal }) => {
      if (!availableTools.has(name)) throw new Error(`DSH tool ${name} is not available for this DSH turn.`);
      if (!agent.ctx?.tools?.execute) throw new Error("The owning DSH Agent has no tool runtime");
      const result = await agent.ctx.tools.execute({
        callId,
        name,
        arguments: args,
        agent,
        signal: signal ?? options.signal ?? new AbortController().signal,
      });
      const materialized = await materializeDshToolImages(
        result,
        this.attachments,
        signal ?? options.signal,
      );
      if (materialized.attachments.length > 0) {
        structuredCallIds.add(String(callId));
        structuredImages.push(...materialized.attachments);
      }
      return materialized.result;
    };
    const claudeSessionId = await this.ensureSession(sessionId);
    const queue = new ActivityQueue(options.signal, "Claude");
    const onActivity = (message) => {
      const candidate = message.params?.sessionId ?? message.params?.session?.id;
      if (candidate === claudeSessionId) queue.push(message);
    };
    const stopActivity = subscribeRuntimeActivity(this.runtime, onActivity);

    let turnId = null;
    try {
      const started = await this.runtime.sendMessage(claudeSessionId, { text, content, ...config, dshTools, executeDshTool });
      turnId = started.id;
      const state = createStreamState({ structuredImages, structuredCallIds });
      let completedTurn = null;
      while (!completedTurn) {
        const message = await queue.next();
        const params = message.params ?? {};
        if (params.turnId && params.turnId !== turnId) continue;
        if (message.method === "turn/completed") {
          if (params.turn?.id !== turnId) continue;
          for (const item of params.turn.items ?? []) {
            for (const chunk of await this.completeItem(agent, claudeSessionId, turnId, item, state, options.signal)) yield chunk;
          }
          completedTurn = params.turn;
          break;
        }
        for (const chunk of await this.projectActivity(agent, claudeSessionId, turnId, message, state, options.signal)) yield chunk;
      }
      for (const block of state.blocks.values()) {
        if (block.closed) continue;
        block.closed = true;
        yield { type: "block-end", index: block.index, block: { type: block.type, text: block.text } };
      }
      if (completedTurn.status === "failed") {
        yield {
          type: "finish",
          reason: { kind: "error", failure: { message: completedTurn.error?.message ?? "Claude turn failed", code: "CLAUDE_TURN_FAILED" } },
        };
      } else {
        const promotion = await promoteFinalAnswerImages({
          text: finalAssistantText(state),
          cwd: agent.session.header.cwd,
          attachments: this.attachments,
          structuredImages: state.structuredImages,
          structuredImageData: state.structuredImageData,
          signal: options.signal,
        });
        for (const chunk of imageOutputChunks(state, promotion.images, promotion.failures)) yield chunk;
        yield { type: "finish", reason: { kind: "stop" }, replayState: { claudeSessionId, turnId } };
      }
    } catch (error) {
      if (options.signal?.aborted) {
        if (turnId) await this.runtime.interruptTurn(claudeSessionId, turnId).catch(() => {});
        yield { type: "finish", reason: { kind: "aborted", failure: { message: "Claude turn cancelled", code: "ABORTED" } } };
        return;
      }
      throw error;
    } finally {
      stopActivity();
      queue.close();
    }
  }

  async *streamAuxiliary(options) {
    await this.ready;
    const text = auxiliaryInput(options.messages);
    if (!text) throw new Error(`Relay Claude adapter received no ${options.purpose} input`);
    const sessionId = String(options.sessionId ?? "");
    const agent = this.agents.get(sessionId);
    const cwd = agent?.session.header.cwd ?? this.settings.get(sessionId)?.cwd ?? process.cwd();
    const created = await this.runtime.createSession({
      model: options.model,
      effort: options.reasoningEffort,
      sandbox: "read-only",
      approvalPolicy: "never",
      cwd,
      ephemeral: true,
      settingSources: ["user"],
      systemPrompt: options.system,
      plugins: [],
    });
    const claudeSessionId = created.id;
    const queue = new ActivityQueue(options.signal, "Claude");
    const onActivity = (message) => {
      const candidate = message.params?.sessionId ?? message.params?.session?.id;
      if (candidate === claudeSessionId) queue.push(message);
    };
    const stopActivity = subscribeRuntimeActivity(this.runtime, onActivity);
    let turnId = null;
    try {
      const started = await this.runtime.sendMessage(claudeSessionId, {
        text,
        model: options.model,
        effort: options.reasoningEffort,
        sandbox: "read-only",
        approvalPolicy: "never",
      });
      turnId = started.id;
      const state = createStreamState();
      let completedTurn = null;
      while (!completedTurn) {
        const message = await queue.next();
        const params = message.params ?? {};
        if (params.turnId && params.turnId !== turnId) continue;
        if (message.method === "turn/completed") {
          if (params.turn?.id !== turnId) continue;
          for (const item of params.turn.items ?? []) {
            for (const chunk of completeAuxiliaryItem(state, item)) yield chunk;
          }
          completedTurn = params.turn;
          break;
        }
        for (const chunk of projectAuxiliaryActivity(message, state)) yield chunk;
      }
      for (const block of state.blocks.values()) {
        if (block.closed) continue;
        block.closed = true;
        yield { type: "block-end", index: block.index, block: { type: block.type, text: block.text } };
      }
      yield completedTurn.status === "failed"
        ? { type: "finish", reason: { kind: "error", failure: { message: completedTurn.error?.message ?? `Claude ${options.purpose} failed`, code: "CLAUDE_AUXILIARY_FAILED" } } }
        : { type: "finish", reason: { kind: "stop" } };
    } finally {
      stopActivity();
      queue.close();
      await this.runtime.releaseSession(claudeSessionId);
    }
  }

  async projectActivity(agent, claudeSessionId, turnId, message, state, signal) {
    const params = message.params ?? {};
    if (message.method === "item/reasoning/summaryTextDelta" || message.method === "item/reasoning/textDelta") {
      return textDelta(state, params.itemId, "reasoning", params.delta ?? "");
    }
    if (message.method === "item/agentMessage/delta") {
      return textDelta(state, params.itemId, "text", params.delta ?? "");
    }
    if (message.method === "item/started") {
      if (isActivityItem(params.item)) this.appendActivity(agent, claudeSessionId, turnId, params.item, "started", state);
      return [];
    }
    if (message.method === "item/completed") return this.completeItem(agent, claudeSessionId, turnId, params.item, state, signal);
    return [];
  }

  async completeItem(agent, claudeSessionId, turnId, item, state, signal) {
    if (!item?.id || state.completed.has(item.id)) return [];
    state.completed.add(item.id);
    if (item.type === "reasoning") return completeTextItem(state, item.id, "reasoning", reasoningText(item));
    if (item.type === "agentMessage") return completeTextItem(state, item.id, "text", item.text ?? "");
    if (isActivityItem(item)) this.appendActivity(agent, claudeSessionId, turnId, item, "completed", state);
    if (Array.isArray(item.images) && !state.structuredCallIds.has(String(item.id))) {
      for (const [index, image] of item.images.entries()) {
        state.structuredImageData.push({ ...image, id: `${item.id}-${index}` });
      }
    }
    return [];
  }

  appendActivity(agent, claudeSessionId, turnId, item, phase, state) {
    const previous = state.activityItems.get(item.id) ?? {};
    const merged = {
      ...previous,
      ...item,
      input: item.input ?? previous.input,
      arguments: item.arguments ?? previous.arguments,
      name: item.name ?? previous.name,
      tool: item.tool ?? previous.tool,
    };
    state.activityItems.set(item.id, merged);
    if (!state.startedActivities.has(item.id)) {
      state.startedActivities.add(item.id);
      agent.session.append(CLAUDE_ACTIVITY_EVENT, activityPayload(claudeSessionId, turnId, merged, "started"));
    }
    if (phase === "completed" && !state.completedActivities.has(item.id)) {
      state.completedActivities.add(item.id);
      agent.session.append(CLAUDE_ACTIVITY_EVENT, activityPayload(claudeSessionId, turnId, merged, "completed"));
    }
  }
}

class ActivityQueue {
  constructor(signal, label) {
    this.signal = signal;
    this.label = label;
    this.values = [];
    this.waiters = [];
    this.closed = false;
  }

  push(value) {
    if (this.closed) return;
    const waiter = this.waiters.shift();
    if (waiter) waiter.resolve(value);
    else this.values.push(value);
  }

  next() {
    if (this.values.length) return Promise.resolve(this.values.shift());
    if (this.closed) return Promise.reject(new Error(`${this.label} activity stream closed`));
    if (this.signal?.aborted) return Promise.reject(this.signal.reason ?? new Error("aborted"));
    return new Promise((resolve, reject) => {
      const waiter = { resolve, reject };
      this.waiters.push(waiter);
      if (this.signal) {
        const abort = () => {
          const index = this.waiters.indexOf(waiter);
          if (index >= 0) this.waiters.splice(index, 1);
          reject(this.signal.reason ?? new Error("aborted"));
        };
        this.signal.addEventListener("abort", abort, { once: true });
        waiter.resolve = (value) => {
          this.signal.removeEventListener("abort", abort);
          resolve(value);
        };
      }
    });
  }

  close() {
    this.closed = true;
    for (const waiter of this.waiters.splice(0)) waiter.reject(new Error(`${this.label} activity stream closed`));
  }
}

function createStreamState({ structuredImages = [], structuredCallIds = new Set() } = {}) {
  return {
    nextIndex: 0,
    blocks: new Map(),
    completed: new Set(),
    activityItems: new Map(),
    startedActivities: new Set(),
    completedActivities: new Set(),
    structuredImages,
    structuredImageData: [],
    structuredCallIds,
  };
}

function textDelta(state, id, type, delta) {
  if (!id || !delta) return [];
  let block = state.blocks.get(id);
  const chunks = [];
  if (!block) {
    block = { index: state.nextIndex++, type, text: "", closed: false };
    state.blocks.set(id, block);
    chunks.push({ type: "block-start", index: block.index, blockType: type });
  }
  if (block.closed) return chunks;
  block.text += delta;
  chunks.push({ type: type === "reasoning" ? "reasoning-delta" : "text-delta", index: block.index, text: delta });
  return chunks;
}

function completeTextItem(state, id, type, completeText) {
  const chunks = [];
  let block = state.blocks.get(id);
  if (!block) {
    block = { index: state.nextIndex++, type, text: "", closed: false };
    state.blocks.set(id, block);
    chunks.push({ type: "block-start", index: block.index, blockType: type });
  }
  if (completeText && completeText.startsWith(block.text) && completeText.length > block.text.length) {
    const delta = completeText.slice(block.text.length);
    block.text = completeText;
    chunks.push({ type: type === "reasoning" ? "reasoning-delta" : "text-delta", index: block.index, text: delta });
  }
  if (!block.closed) {
    block.closed = true;
    chunks.push({ type: "block-end", index: block.index, block: { type, text: block.text } });
  }
  return chunks;
}

function finalAssistantText(state) {
  return [...state.blocks.values()]
    .filter(block => block.type === "text" && block.text.trim())
    .sort((left, right) => right.index - left.index)[0]?.text ?? "";
}

function imageOutputChunks(state, images, failures) {
  const chunks = [];
  if (failures.length > 0) {
    const text = failures.map(({ path, reason }) => (
      `Image preview unavailable for ${JSON.stringify(path)}: ${reason}.`
    )).join("\n");
    const index = state.nextIndex++;
    chunks.push(
      { type: "block-start", index, blockType: "text" },
      { type: "text-delta", index, text },
      { type: "block-end", index, block: { type: "text", text } },
    );
  }
  for (const attachment of images) {
    const index = state.nextIndex++;
    chunks.push(
      { type: "block-start", index, blockType: "image" },
      { type: "block-end", index, block: { type: "image", attachment } },
    );
  }
  return chunks;
}

function activityPayload(claudeSessionId, turnId, item, phase) {
  const activity = normalizeActivity(item, phase);
  return { version: 1, claudeSessionId, turnId, itemId: String(item.id), phase, activity };
}

function normalizeActivity(item, phase) {
  const type = String(item.type ?? "toolUse");
  const status = phase === "started" ? "running" : item.status === "failed" ? "error" : "completed";
  const title = item.tool ?? item.name ?? humanize(type);
  return bounded({
    type,
    status,
    title,
    summary: summarizeValue(item.arguments ?? item.input ?? item.prompt),
    input: item.arguments ?? item.input,
    output: item.output ?? item.result ?? item.error,
  });
}

function bounded(value) {
  return Object.fromEntries(Object.entries(value).flatMap(([key, entry]) => {
    if (entry === undefined || entry === null || entry === "") return [];
    const text = typeof entry === "string" ? entry : JSON.stringify(entry, null, 2);
    return [[key, text.length > 20_000 ? `${text.slice(0, 20_000)}\n...` : text]];
  }));
}

function isActivityItem(item) {
  return item?.id && !["userMessage", "agentMessage", "reasoning"].includes(item.type);
}

function permissionConfiguration(events) {
  let sandbox = "workspace-write";
  let approvalPolicy = "on-request";
  for (const event of events) {
    if (event.type === "sandbox/mode") sandbox = event.data.mode;
    if (event.type === "approval/policy") approvalPolicy = event.data.policy === "never" ? "never" : "on-request";
    if (event.type === "permission/preset") sandbox = event.data.preset;
  }
  return { sandbox, approvalPolicy };
}

function reasoningText(item) {
  return [...(item.summary ?? []), ...(item.content ?? [])].filter(Boolean).join("\n\n");
}

function summarizeValue(value) {
  if (value === undefined || value === null) return "";
  return firstLine(typeof value === "string" ? value : JSON.stringify(value));
}

function firstLine(value) {
  return String(value ?? "").split("\n")[0].slice(0, 240);
}

function humanize(value) {
  return String(value).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, letter => letter.toUpperCase());
}

function reasoningEffortName(value) {
  return String(value) === "xhigh" ? "Extra high" : humanize(value);
}

function latestUserContent(messages, attachments, signal) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role !== "user") continue;
    if (message.source?.kind !== "user" && !isRelayActivation(message.source)) continue;
    const blocks = message.content ?? [];
    const content = blocks.some(block => block?.type === "image")
      ? readClaudeContent(blocks, attachments, signal)
      : textContent(blocks);
    if (Array.isArray(content) && content.length === 0) continue;
    return content;
  }
  return [];
}

function textContent(blocks) {
  const text = blocks
    .filter(block => block?.type === "text")
    .map(block => String(block.text ?? ""))
    .join("\n")
    .trim();
  return text ? [{ type: "text", text }] : [];
}

async function readClaudeContent(blocks, attachments, signal) {
  const content = [];
  for (const block of blocks) {
    if (block?.type === "text" && String(block.text ?? "").trim()) {
      content.push({ type: "text", text: String(block.text) });
    }
    if (block?.type === "image") content.push(await readClaudeImage(block, attachments, signal));
  }
  return content;
}

async function readClaudeImage(block, attachments, signal) {
  signal?.throwIfAborted();
  const ref = block?.attachment;
  const id = String(ref?.attachmentId ?? "unknown");
  if (!ref || !CLAUDE_IMAGE_MEDIA_TYPES.has(ref.mediaType)) {
    throw claudeImageError(
      `Claude cannot read image attachment ${id}: media type ${ref?.mediaType ?? "unknown"} is unsupported.`,
      "CLAUDE_IMAGE_TYPE_UNSUPPORTED",
    );
  }
  if (typeof attachments?.readImage !== "function") {
    throw claudeImageError(
      `Claude cannot read image attachment ${id}: the DSH attachment service is unavailable.`,
      "CLAUDE_IMAGE_ATTACHMENTS_UNAVAILABLE",
    );
  }
  let stored;
  try {
    stored = await attachments.readImage(ref, signal);
  } catch (error) {
    if (signal?.aborted) throw signal.reason ?? error;
    throw claudeImageError(
      `Claude cannot read image attachment ${id}: the attachment is missing or corrupt.`,
      "CLAUDE_IMAGE_READ_FAILED",
      error,
    );
  }
  const mediaType = stored?.ref?.mediaType;
  if (!CLAUDE_IMAGE_MEDIA_TYPES.has(mediaType) || !(stored?.data instanceof Uint8Array)) {
    throw claudeImageError(
      `Claude cannot read image attachment ${id}: the attachment store returned invalid image data.`,
      "CLAUDE_IMAGE_READ_FAILED",
    );
  }
  return { type: "image", mediaType, data: Buffer.from(stored.data).toString("base64") };
}

function claudeImageError(message, code, cause) {
  return Object.assign(new Error(message, cause ? { cause } : undefined), { code });
}

const CLAUDE_IMAGE_MEDIA_TYPES = new Set(["image/png", "image/jpeg", "image/gif", "image/webp"]);

function auxiliaryInput(messages) {
  return messages.map((message) => {
    const text = (message?.content ?? [])
      .filter(block => block.type === "text")
      .map(block => block.text)
      .join("\n")
      .trim();
    return text ? `${message.role ?? "user"}: ${text}` : "";
  }).filter(Boolean).join("\n\n");
}

function projectAuxiliaryActivity(message, state) {
  const params = message.params ?? {};
  if (message.method === "item/reasoning/summaryTextDelta" || message.method === "item/reasoning/textDelta") {
    return textDelta(state, params.itemId, "reasoning", params.delta ?? "");
  }
  if (message.method === "item/agentMessage/delta") return textDelta(state, params.itemId, "text", params.delta ?? "");
  if (message.method === "item/completed") return completeAuxiliaryItem(state, params.item);
  return [];
}

function completeAuxiliaryItem(state, item) {
  if (!item?.id || state.completed.has(item.id)) return [];
  state.completed.add(item.id);
  if (item.type === "reasoning") return completeTextItem(state, item.id, "reasoning", reasoningText(item));
  if (item.type === "agentMessage") return completeTextItem(state, item.id, "text", item.text ?? "");
  return [];
}

function isRelayActivation(source) {
  return source?.kind === "plugin" && source.plugin === "relay";
}

function compact(value) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && item !== null));
}

function runtimeModels(runtime) {
  return typeof runtime.listModels === "function" ? runtime.listModels() : [...runtime.models];
}

function hasRuntimeSession(runtime, sessionId) {
  return typeof runtime.hasSession === "function"
    ? runtime.hasSession(sessionId)
    : runtime.sessions.has(sessionId);
}

function patchRuntimeSession(runtime, sessionId, patch) {
  if (typeof runtime.patchSession === "function") return runtime.patchSession(sessionId, patch);
  const session = runtime.sessions.get(sessionId);
  if (session) Object.assign(session, patch);
  return Boolean(session);
}

function subscribeRuntimeActivity(runtime, listener) {
  if (typeof runtime.subscribeActivity === "function") return runtime.subscribeActivity(listener);
  runtime.on("activity", listener);
  return () => runtime.off("activity", listener);
}

function effectivePreset(session) {
  const events = sessionEvents(session);
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];
    if (event.type === "agent-preset/selected") return event.data.agentPreset;
  }
  return session.header.agentPreset;
}
