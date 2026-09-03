import assert from "node:assert/strict";
import test from "node:test";

import { sessionEvents } from "../dsh-compat.mjs";

import { Session, SessionId } from "@deepseek-ai/dsh-session";

import {
  buildClaudeHistorySeed,
  claudeHistoryProjection,
  DshClaudeImportTarget,
} from "../dsh-import-target.js";

test("Claude history projects ordered text, reasoning, and completed tool activity into valid DSH events", () => {
  const source = [
    message("user", "user-1", [{ type: "text", text: "  inspect workspace  " }]),
    message("assistant", "assistant-thinking", [{ type: "thinking", thinking: "Checked files.", signature: "private" }]),
    message("assistant", "assistant-tool", [{ type: "tool_use", id: "tool-1", name: "Bash", input: { command: "pwd" } }]),
    message("user", "tool-result", [{ type: "tool_result", tool_use_id: "tool-1", content: [
      { type: "text", text: "/workspace/relay\n" },
      { type: "image", source: { data: "not-projected" } },
    ] }]),
    message("assistant", "assistant-final", [{ type: "text", text: "Done." }]),
  ];
  const projection = claudeHistoryProjection(source);
  assert.equal(projection.turns.length, 1);
  assert.equal(projection.skippedBlocks, 1);
  assert.deepEqual(projection.turns[0].timeline.map(entry => entry.kind), [
    "message", "message", "activity", "message",
  ]);

  const seed = buildClaudeHistorySeed(projection, 1_788_000_000_000, {
    model: "sonnet",
    effort: "high",
  });
  const session = Session.create(SessionId("claude-import-fixture"), seed);
  const messages = session.deriveMessages();
  assert.deepEqual(messages.map(item => item.role), ["user", "assistant", "assistant", "user", "assistant"]);
  assert.deepEqual(messages.flatMap(item => item.content.map(block => block.type)), [
    "text", "reasoning", "tool-call", "tool-result", "text",
  ]);
  assert.equal(messages[0].content[0].text, "inspect workspace");
  assert.equal(messages[1].content[0].text, "Checked files.");
  assert.equal(messages[2].content[0].name, "Bash");
  assert.deepEqual(JSON.parse(messages[2].content[0].arguments), { command: "pwd" });
  assert.equal(messages[3].content[0].content[0].text, "/workspace/relay\n");
  assert.equal(messages[4].content[0].text, "Done.");
  assert.equal(sessionEvents(session).at(-1).type, "session/end-seed");
});

test("Claude history projects the public SDK terminal user-string message shape", () => {
  const projection = claudeHistoryProjection([
    {
      type: "user",
      uuid: "terminal-user",
      session_id: "native-terminal",
      parent_tool_use_id: null,
      message: { role: "user", content: "Reply with the terminal marker" },
    },
    message("assistant", "terminal-assistant", [{ type: "text", text: "terminal marker" }]),
  ]);

  assert.equal(projection.turns.length, 1);
  assert.equal(projection.skippedBlocks, 0);
  const session = Session.create(
    SessionId("claude-import-terminal-string"),
    buildClaudeHistorySeed(projection, 100, { model: "sonnet" }),
  );
  assert.deepEqual(session.deriveMessages().map(item => ({
    role: item.role,
    text: item.content[0].text,
  })), [
    { role: "user", text: "Reply with the terminal marker" },
    { role: "assistant", text: "terminal marker" },
  ]);
});

test("Claude history skips malformed, private, unmatched, and pre-turn blocks deterministically", () => {
  const source = [
    message("assistant", "orphan", [{ type: "text", text: "not user-owned" }]),
    message("user", "user-1", [{ type: "text", text: "question" }]),
    message("assistant", "assistant-1", [
      { type: "redacted_thinking", data: "private" },
      { type: "tool_use", id: "unmatched", name: "Read", input: { file_path: "x" } },
      { type: "text", text: "answer" },
    ]),
    { type: "system", uuid: "system-1", session_id: "native-1", parent_tool_use_id: null, message: { content: [{ type: "text", text: "system" }] } },
  ];

  const first = claudeHistoryProjection(source);
  const second = claudeHistoryProjection(structuredClone(source));
  assert.deepEqual(second, first);
  assert.equal(first.turns.length, 1);
  assert.equal(first.turns[0].timeline.length, 2);
  assert.equal(first.skippedBlocks, 4);
  const seed = buildClaudeHistorySeed(first, 100, { model: "sonnet" });
  assert.doesNotThrow(() => Session.create(SessionId("claude-import-skips"), seed));
});

test("DSH import target persists title and projection before Workspace attachment", async () => {
  const calls = [];
  const source = {
    sessionId: "native-target",
    cwd: "/workspace/relay",
    customTitle: "Imported target",
    createdAt: 1_700_000_000_000,
    lastModified: 1_700_000_100_000,
    messages: [message("user", "user-target", [{ type: "text", text: "continue this" }])],
  };
  let createdOptions = null;
  const session = { header: {}, events: [] };
  const handle = { agent: { session }, async dispose() { calls.push("dispose"); } };
  const target = new DshClaudeImportTarget({
    ctx: {
      agents: {
        get: () => undefined,
        async create(options) {
          calls.push("create");
          createdOptions = options;
          return handle;
        },
      },
      sessions: { async flush(candidate) { assert.equal(candidate, session); calls.push("flush"); } },
      sessionPersistence: { async list() { return []; } },
      workspaceRegistry: {
        async resolveByPath(path) {
          assert.equal(path, source.cwd);
          return {
            async attachSession(sessionId) {
              assert.equal(String(sessionId), "claude-import-target");
              calls.push("attach");
            },
          };
        },
      },
      get(name) {
        if (name === "sessionTitle") return {
          get: () => undefined,
          rename(candidate, title) {
            assert.equal(candidate, session);
            assert.equal(title, source.customTitle);
            calls.push("title");
          },
        };
        if (name === "sessionProjectionCache") return {
          async write(candidate) {
            assert.equal(candidate, session);
            calls.push("projection-cache");
          },
        };
        return undefined;
      },
    },
  });
  const input = {
    session: source,
    source,
    workspaceCwd: source.cwd,
    binding: {
      sessionId: "claude-import-target",
      config: { model: "sonnet", effort: "high", cwd: source.cwd },
    },
  };

  const transaction = await target.prepare(input);
  await target.hydrate(transaction);
  await target.attach(transaction);
  await target.finalize(transaction);
  await target.release(transaction);

  assert.equal(createdOptions.sessionId, "claude-import-target");
  assert.equal(createdOptions.meta.createdAt, source.createdAt);
  assert.equal(createdOptions.meta.agentPreset, "relay-claude");
  assert.equal(createdOptions.seed.some(event => event.type === "user/message"), true);
  assert.deepEqual(calls, [
    "create", "title", "flush", "projection-cache", "attach", "flush", "dispose",
  ]);
});

test("DSH import target resumes a persisted deterministic Session and fails closed without projection durability", async () => {
  const calls = [];
  const session = {};
  const handle = { agent: { session }, async dispose() {} };
  const target = new DshClaudeImportTarget({
    ctx: {
      agents: {
        get: () => undefined,
        async create() { throw new Error("must not create"); },
        async resume(options) { calls.push(options); return handle; },
      },
      sessions: { async flush() {} },
      sessionPersistence: { async list() { return [{ id: "claude-import-persisted" }]; } },
      get(name) {
        return name === "sessionTitle"
          ? { get: () => undefined, rename() {} }
          : undefined;
      },
    },
  });
  const input = {
    session: { sessionId: "native", cwd: "/workspace/relay", lastModified: 10 },
    source: { sessionId: "native", cwd: "/workspace/relay", lastModified: 10, messages: [] },
    workspaceCwd: "/workspace/relay",
    binding: { sessionId: "claude-import-persisted", config: { model: "sonnet" } },
  };

  const transaction = await target.prepare(input);
  assert.equal(calls.length, 1);
  assert.equal(String(calls[0].resumeSessionId), "claude-import-persisted");
  await assert.rejects(target.hydrate(transaction), /sessionProjectionCache/);
});

test("a projection-cache failure retries by resuming the Session already flushed in this process", async () => {
  let createCount = 0;
  let resumeCount = 0;
  const session = {};
  const handle = { agent: { session }, async dispose() {} };
  const target = new DshClaudeImportTarget({
    ctx: {
      agents: {
        get: () => undefined,
        async create() { createCount += 1; return handle; },
        async resume() { resumeCount += 1; return handle; },
      },
      sessions: { async flush() {} },
      sessionPersistence: { async list() { return []; } },
      get(name) {
        return name === "sessionTitle"
          ? { get: () => undefined, rename() {} }
          : undefined;
      },
    },
  });
  const input = {
    session: { sessionId: "native-retry", cwd: "/workspace/relay", lastModified: 10 },
    source: { sessionId: "native-retry", cwd: "/workspace/relay", lastModified: 10, messages: [] },
    workspaceCwd: "/workspace/relay",
    binding: { sessionId: "claude-import-retry", config: { model: "sonnet" } },
  };

  const first = await target.prepare(input);
  await assert.rejects(target.hydrate(first), /sessionProjectionCache/);
  const second = await target.prepare(input);

  assert.equal(second.agent.session, session);
  assert.equal(createCount, 1);
  assert.equal(resumeCount, 1);
});

function message(type, uuid, content) {
  return {
    type,
    uuid,
    session_id: "native-1",
    parent_tool_use_id: null,
    message: { role: type, content },
  };
}
