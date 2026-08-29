import { createHash } from "node:crypto";

import { CallId, freezeMessage, MessageId } from "@deepseek-ai/dsh-llm";
import { SessionId } from "@deepseek-ai/dsh-session";

import { CLAUDE_PRESET, CLAUDE_PROVIDER } from "./claude-adapter.js";

export class DshClaudeImportTarget {
  constructor({ ctx, logger = console }) {
    this.ctx = ctx;
    this.logger = logger;
    this.persistedIds = null;
  }

  async prepare(input) {
    const sessionId = SessionId(input.binding.sessionId);
    const projection = claudeHistoryProjection(input.source.messages ?? []);
    const seed = buildClaudeHistorySeed(projection, input.source.lastModified, input.binding.config);
    const resident = this.ctx.agents.get(sessionId);
    if (resident) return { ...input, projection, seed, agent: resident, handle: null };

    const persistedIds = await this.loadPersistedIds();
    const agentOptions = {
      provider: CLAUDE_PROVIDER,
      model: input.binding.config.model,
    };
    const handle = persistedIds.has(sessionId)
      ? await this.ctx.agents.resume({ resumeSessionId: sessionId, agentOptions })
      : await this.ctx.agents.create({
          sessionId,
          seed,
          agentOptions,
          meta: {
            cwd: input.source.cwd,
            createdAt: importedCreatedAt(input.source, seed),
            agentPreset: CLAUDE_PRESET,
          },
        });
    return { ...input, projection, seed, agent: handle.agent, handle };
  }

  async hydrate(transaction) {
    applySessionTitle(this.ctx, transaction.agent.session, transaction.source);
    await this.ctx.sessions.flush(transaction.agent.session);
    (await this.loadPersistedIds()).add(SessionId(transaction.binding.sessionId));
    const projectionCache = this.ctx.get?.("sessionProjectionCache");
    if (!projectionCache?.write) {
      throw new Error("Claude Session import requires DSH's sessionProjectionCache service");
    }
    await projectionCache.write(transaction.agent.session);
    return projectionSummary(transaction.projection);
  }

  async attach(transaction) {
    const workspace = await this.ctx.workspaceRegistry.resolveByPath(transaction.workspaceCwd);
    if (!workspace) throw new Error(`No registered DSH Workspace matches ${transaction.workspaceCwd}`);
    await workspace.attachSession(SessionId(transaction.binding.sessionId));
  }

  async finalize(transaction) {
    await this.ctx.sessions.flush(transaction.agent.session);
    (await this.loadPersistedIds()).add(SessionId(transaction.binding.sessionId));
  }

  async release(transaction) {
    await transaction.handle?.dispose();
  }

  async loadPersistedIds() {
    if (this.persistedIds === null) {
      this.persistedIds = new Set(
        (await this.ctx.sessionPersistence.list()).map(header => SessionId(header.id)),
      );
    }
    return this.persistedIds;
  }
}

export function buildClaudeHistorySeed(projection, updatedAt, config) {
  const time = timestampMs(updatedAt);
  const events = [];
  const append = (type, data, surfaceOp = null) => {
    events.push({
      type,
      seq: events.length,
      time,
      data,
      ...(surfaceOp === null ? {} : { surfaceOp }),
    });
  };

  append("request/header", {
    header: {
      config: {
        provider: CLAUDE_PROVIDER,
        model: config.model,
        ...(config.effort ? { reasoningEffort: config.effort } : {}),
      },
    },
    reason: "initial",
  });

  let turn = 1;
  for (const sourceTurn of projection.turns) {
    if (sourceTurn.timeline.length === 0) continue;
    append("turn/start", { turn });
    let step = 0;
    for (const entry of sourceTurn.timeline) {
      if (entry.kind === "message" && entry.role === "user") {
        append("user/message", freezeMessage({
          id: MessageId(entry.id),
          role: "user",
          content: entry.content,
          source: { kind: "user" },
        }), "append");
        continue;
      }

      step += 1;
      append("step/start", { turn, step });
      if (entry.kind === "message") {
        append("assistant/message", {
          turn,
          step,
          message: freezeMessage({
            id: MessageId(entry.id),
            role: "assistant",
            content: entry.content,
            source: { kind: "model", provider: CLAUDE_PROVIDER, model: "imported" },
          }),
        }, "append");
      } else {
        const callId = CallId(entry.callId);
        append("assistant/message", {
          turn,
          step,
          message: freezeMessage({
            id: MessageId(entry.requestId),
            role: "assistant",
            content: [{ type: "tool-call", id: callId, name: entry.name, arguments: entry.arguments }],
            source: { kind: "model", provider: CLAUDE_PROVIDER, model: "imported" },
          }),
        }, "append");
        append("tool/call", { turn, step, callId, name: entry.name, arguments: entry.arguments });
        append("tool/result", {
          turn,
          step,
          message: freezeMessage({
            id: MessageId(entry.resultId),
            role: "user",
            content: [{
              type: "tool-result",
              toolCallId: callId,
              content: entry.content,
              isError: entry.isError,
            }],
            source: { kind: "tool", callId },
          }),
        }, "append");
      }
      append("step/end", { turn, step });
    }
    append("turn/end", { turn, reason: { kind: "stop" } });
    turn += 1;
  }
  return events;
}

export function claudeHistoryProjection(messages) {
  const turns = [];
  const pendingTools = new Map();
  let current = null;
  let skippedBlocks = 0;

  for (const source of messages) {
    const content = sourceContentBlocks(source);
    if (source?.type === "user" && source.parent_tool_use_id == null) {
      const blocks = content
        .filter(block => block?.type === "text" && normalizedText(block.text))
        .map(block => ({ type: "text", text: normalizedText(block.text) }));
      if (blocks.length > 0) {
        skippedBlocks += content.filter(block => block?.type !== "text").length;
        current = { sourceId: source.uuid, timeline: [] };
        current.timeline.push({
          kind: "message",
          role: "user",
          id: projectionId(source, "user"),
          content: blocks,
        });
        turns.push(current);
        continue;
      }
    }
    if (!current) {
      skippedBlocks += content.length;
      continue;
    }

    if (source?.type === "assistant") {
      for (const [index, block] of content.entries()) {
        if (block?.type === "thinking" && normalizedText(block.thinking)) {
          current.timeline.push({
            kind: "message",
            role: "assistant",
            id: projectionId(source, `thinking-${index}`),
            content: [{ type: "reasoning", text: normalizedText(block.thinking) }],
          });
        } else if (block?.type === "text" && normalizedText(block.text)) {
          current.timeline.push({
            kind: "message",
            role: "assistant",
            id: projectionId(source, `text-${index}`),
            content: [{ type: "text", text: normalizedText(block.text) }],
          });
        } else if (block?.type === "tool_use" && normalizedText(block.id) && normalizedText(block.name)) {
          pendingTools.set(block.id, {
            turn: current,
            source,
            index,
            name: block.name,
            arguments: jsonText(block.input),
          });
        } else {
          skippedBlocks += 1;
        }
      }
      continue;
    }

    if (source?.type === "user") {
      for (const block of content) {
        if (block?.type !== "tool_result" || !pendingTools.has(block.tool_use_id)) {
          skippedBlocks += 1;
          continue;
        }
        const tool = pendingTools.get(block.tool_use_id);
        pendingTools.delete(block.tool_use_id);
        const result = toolResultContent(block.content);
        skippedBlocks += result.skipped;
        tool.turn.timeline.push({
          kind: "activity",
          requestId: projectionId(tool.source, `tool-${tool.index}-request`),
          resultId: projectionId(source, `tool-${tool.index}-result`),
          callId: `claude:${block.tool_use_id}`,
          name: tool.name,
          arguments: tool.arguments,
          content: result.content,
          isError: block.is_error === true,
        });
      }
      continue;
    }
    skippedBlocks += content.length;
  }
  skippedBlocks += pendingTools.size;
  return { turns, skippedBlocks };
}

function sourceContentBlocks(source) {
  const value = source?.message?.content;
  if (Array.isArray(value)) return value;
  if (source?.type === "user" && normalizedText(value)) {
    return [{ type: "text", text: value }];
  }
  return [];
}

function toolResultContent(value) {
  if (typeof value === "string") return {
    content: [{ type: "text", text: value }],
    skipped: 0,
  };
  if (!Array.isArray(value)) return { content: [], skipped: value == null ? 0 : 1 };
  const content = value
    .filter(block => block?.type === "text" && typeof block.text === "string")
    .map(block => ({ type: "text", text: block.text }));
  return { content, skipped: value.length - content.length };
}

function projectionSummary(projection) {
  return {
    projectedTurns: projection.turns.length,
    projectedMessages: projection.turns.reduce((count, turn) => count + turn.timeline.length, 0),
    skippedBlocks: projection.skippedBlocks,
  };
}

function projectionId(message, suffix) {
  const digest = createHash("sha256")
    .update(`${message.session_id ?? "session"}:${message.uuid ?? "message"}:${suffix}`)
    .digest("hex")
    .slice(0, 24);
  return `claude:${digest}`;
}

function importedCreatedAt(source, seed) {
  const updated = timestampMs(source.lastModified);
  if (!seed.some(event => event.type === "user/message")) return updated;
  return Math.min(timestampMs(source.createdAt, updated), updated);
}

function timestampMs(value, fallback = Date.now()) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return fallback;
  return Math.trunc(value < 1_000_000_000_000 ? value * 1000 : value);
}

function applySessionTitle(ctx, session, source) {
  const titles = ctx.get?.("sessionTitle");
  if (!titles) throw new Error("Claude Session import requires DSH's sessionTitle service");
  const title = summarizeTitle(source.customTitle)
    || summarizeTitle(source.summary)
    || summarizeTitle(source.firstPrompt)
    || `Claude ${String(source.sessionId).slice(0, 8)}`;
  if (titles.get(session)?.title !== title) titles.rename(session, title);
}

function summarizeTitle(value) {
  const text = normalizedText(value).replace(/\s+/g, " ");
  return text.length > 80 ? `${text.slice(0, 79)}...` : text;
}

function normalizedText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function jsonText(value) {
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch {
    return "{}";
  }
}
